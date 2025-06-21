import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './SecondRoundNews.css';

const SecondRoundNews = ({ user, onClose }) => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [targetedNews, setTargetedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newsLoading, setNewsLoading] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [showFullArticle, setShowFullArticle] = useState(false);

    useEffect(() => {
        if (user && user.cnp) {
            loadSecondRoundCandidates();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCandidate) {
            generateDynamicNews();
        }
    }, [selectedCandidate]);

    const loadSecondRoundCandidates = async () => {
        try {
            setLoading(true);
            const results = await apiService.getElectionResults();
            
            if (results && results.firstRoundResults) {
                // Get top 2 candidates from first round
                const topCandidates = results.firstRoundResults.slice(0, 2);
                setCandidates(topCandidates);
                
                // Auto-select first candidate
                if (topCandidates.length > 0) {
                    setSelectedCandidate(topCandidates[0]);
                }
            }
        } catch (error) {
            console.error('Error loading second round candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateDynamicNews = async () => {
        if (!selectedCandidate || candidates.length < 2) return;
        
        try {
            setNewsLoading(true);
            
            // Get the other candidate
            const otherCandidate = candidates.find(c => c.candidate_id !== selectedCandidate.candidate_id);
            
            if (!otherCandidate) return;
            
            // Clear existing news for both candidates
            await apiService.clearUserTargetedNews(user.cnp);
            
            // Generate positive news for selected candidate
            await apiService.generateUserTargetedNews(user.cnp, selectedCandidate.candidate_id, 'positive');
            await apiService.generateUserTargetedNews(user.cnp, selectedCandidate.candidate_id, 'positive');
            await apiService.generateUserTargetedNews(user.cnp, selectedCandidate.candidate_id, 'positive');
            
            // Generate negative news for the other candidate
            await apiService.generateUserTargetedNews(user.cnp, otherCandidate.candidate_id, 'negative');
            await apiService.generateUserTargetedNews(user.cnp, otherCandidate.candidate_id, 'negative');
            await apiService.generateUserTargetedNews(user.cnp, otherCandidate.candidate_id, 'negative');
            
            // Load the fresh news
            const news = await apiService.getUserTargetedNews(user.cnp, 10);
            setTargetedNews(Array.isArray(news) ? news : []);
            
        } catch (error) {
            console.error('Error generating dynamic news:', error);
        } finally {
            setNewsLoading(false);
        }
    };

    const handleCandidateSelect = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const handleNewsClick = (news) => {
        setSelectedNews(news);
        setShowFullArticle(true);
        
        // Mark as read
        if (!news.is_read) {
            apiService.markNewsAsRead(news.id, user.cnp);
        }
    };

    const handleClose = () => {
        setShowFullArticle(false);
        setSelectedNews(null);
        if (onClose) onClose();
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '👍';
            case 'negative': return '👎';
            case 'neutral': return '📰';
            default: return '📰';
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '#4caf50';
            case 'negative': return '#f44336';
            case 'neutral': return '#2196f3';
            default: return '#666';
        }
    };

    if (loading) {
        return (
            <div className="second-round-news-container">
                <div className="second-round-news-header">
                    <h3>🏆 Second Round News</h3>
                    <button onClick={handleClose} className="close-btn">×</button>
                </div>
                <div className="loading">Loading second round candidates...</div>
            </div>
        );
    }

    if (showFullArticle && selectedNews) {
        return (
            <div className="second-round-news-container full-article">
                <div className="second-round-news-header">
                    <h3>🏆 Second Round News</h3>
                    <button onClick={handleClose} className="close-btn">×</button>
                </div>
                <div className="full-article-content">
                    <div className="article-header">
                        <h2>{selectedNews.title}</h2>
                        <div className="article-meta">
                            <span className="source">{selectedNews.source}</span>
                            <span className="sentiment" style={{ color: getSentimentColor(selectedNews.sentiment) }}>
                                {getSentimentIcon(selectedNews.sentiment)} {selectedNews.sentiment}
                            </span>
                            <span className="category">{selectedNews.category}</span>
                        </div>
                    </div>
                    <div className="article-body">
                        <p>{selectedNews.content}</p>
                    </div>
                    <div className="article-footer">
                        <p className="targeting-note">
                            💡 This news was generated based on your selection of {selectedNews.candidate_name}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="second-round-news-container">
            <div className="second-round-news-header">
                <h3>🏆 Second Round News</h3>
                <button onClick={handleClose} className="close-btn">×</button>
            </div>
            
            <div className="candidates-selection">
                <h4>Select a candidate to see personalized news:</h4>
                <div className="candidates-grid">
                    {candidates.map((candidate) => (
                        <div 
                            key={candidate.candidate_id}
                            className={`candidate-card ${selectedCandidate?.candidate_id === candidate.candidate_id ? 'selected' : ''}`}
                            onClick={() => handleCandidateSelect(candidate)}
                        >
                            <div className="candidate-info">
                                <h5>{candidate.candidate_name}</h5>
                                <p className="candidate-party">{candidate.candidate_party}</p>
                                <p className="candidate-votes">{candidate.votes} votes</p>
                            </div>
                            {selectedCandidate?.candidate_id === candidate.candidate_id && (
                                <div className="selection-indicator">✓ Selected</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            {selectedCandidate && (
                <div className="dynamic-news-section">
                    <div className="news-header-section">
                        <h4>📰 News for {selectedCandidate.candidate_name}</h4>
                        {newsLoading && <div className="news-loading">Generating fresh news...</div>}
                    </div>
                    
                    <div className="news-content">
                        {targetedNews.length === 0 ? (
                            <div className="no-news">
                                <p>No news available. Select a candidate to generate personalized news.</p>
                            </div>
                        ) : (
                            <div className="news-list">
                                {targetedNews.map((news) => (
                                    <div 
                                        key={news.id} 
                                        className={`news-item ${!news.is_read ? 'unread' : ''}`}
                                        onClick={() => handleNewsClick(news)}
                                    >
                                        <div className="news-header">
                                            <h5>{news.title}</h5>
                                            <span 
                                                className="sentiment-badge"
                                                style={{ backgroundColor: getSentimentColor(news.sentiment) }}
                                            >
                                                {getSentimentIcon(news.sentiment)}
                                            </span>
                                        </div>
                                        <div className="news-meta">
                                            <span className="source">{news.source}</span>
                                            <span className="candidate">{news.candidate_name}</span>
                                            <span className="category">{news.category}</span>
                                        </div>
                                        <div className="news-preview">
                                            {news.content.substring(0, 100)}...
                                        </div>
                                        {!news.is_read && <div className="unread-indicator">NEW</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecondRoundNews; 