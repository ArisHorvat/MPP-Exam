import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './UserTargetedNews.css';

const UserTargetedNews = ({ user, candidateId = null, onClose }) => {
    const [targetedNews, setTargetedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState(null);
    const [showFullArticle, setShowFullArticle] = useState(false);

    useEffect(() => {
        if (user && user.cnp) {
            loadTargetedNews();
        }
    }, [user, candidateId]);

    const loadTargetedNews = async () => {
        try {
            setLoading(true);
            let news;
            
            if (candidateId) {
                // Get news for specific candidate
                news = await apiService.getUserTargetedNewsForCandidate(user.cnp, candidateId, 3);
            } else {
                // Get general targeted news
                news = await apiService.getUserTargetedNews(user.cnp, 5);
            }
            
            // Ensure news is always an array
            setTargetedNews(Array.isArray(news) ? news : []);
        } catch (error) {
            console.error('Error loading targeted news:', error);
            setTargetedNews([]);
        } finally {
            setLoading(false);
        }
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
            <div className="targeted-news-container">
                <div className="targeted-news-header">
                    <h3>🎯 Your Personalized News</h3>
                    <button onClick={handleClose} className="close-btn">×</button>
                </div>
                <div className="loading">Loading your personalized news...</div>
            </div>
        );
    }

    if (showFullArticle && selectedNews) {
        return (
            <div className="targeted-news-container full-article">
                <div className="targeted-news-header">
                    <h3>🎯 Personalized News</h3>
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
                            💡 This news was personalized for you based on your preferences for {selectedNews.candidate_name}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="targeted-news-container">
            <div className="targeted-news-header">
                <h3>🎯 Your Personalized News</h3>
                <button onClick={handleClose} className="close-btn">×</button>
            </div>
            
            <div className="targeted-news-content">
                {targetedNews.length === 0 ? (
                    <div className="no-news">
                        <p>No personalized news available yet.</p>
                        <button 
                            onClick={() => apiService.generateUserPreferences(user.cnp)}
                            className="generate-btn"
                        >
                            Generate My Preferences
                        </button>
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
                                    <h4>{news.title}</h4>
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
            
            <div className="targeted-news-footer">
                <button 
                    onClick={() => apiService.generateTargetedNewsForAllUsers()}
                    className="generate-all-btn"
                >
                    🔄 Generate More News
                </button>
            </div>
        </div>
    );
};

export default UserTargetedNews; 