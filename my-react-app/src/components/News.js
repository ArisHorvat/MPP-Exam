import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './News.css';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, positive, negative, neutral
    const [selectedCandidate, setSelectedCandidate] = useState('all');
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        fetchNews();
        fetchCandidates();
    }, []);

    const fetchNews = async () => {
        try {
            const data = await apiService.getNews(100);
            setNews(data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        try {
            const data = await apiService.getCandidates();
            setCandidates(data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '#4CAF50';
            case 'negative': return '#F44336';
            case 'neutral': return '#FF9800';
            default: return '#757575';
        }
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '👍';
            case 'negative': return '👎';
            case 'neutral': return '📰';
            default: return '📄';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredNews = (news || []).filter(article => {
        const matchesFilter = filter === 'all' || article.sentiment === filter;
        const matchesCandidate = selectedCandidate === 'all' || article.candidate_id === parseInt(selectedCandidate);
        return matchesFilter && matchesCandidate;
    });

    if (loading) {
        return (
            <div className="news-container">
                <div className="loading">Loading news...</div>
            </div>
        );
    }

    return (
        <div className="news-container">
            <div className="news-header">
                <h1>📰 Political News Feed</h1>
                <p>Stay updated with the latest news about our candidates</p>
            </div>

            <div className="news-filters">
                <div className="filter-group">
                    <label>Sentiment:</label>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Sentiments</option>
                        <option value="positive">Positive</option>
                        <option value="negative">Negative</option>
                        <option value="neutral">Neutral</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Candidate:</label>
                    <select 
                        value={selectedCandidate} 
                        onChange={(e) => setSelectedCandidate(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Candidates</option>
                        {candidates.map(candidate => (
                            <option key={candidate.id} value={candidate.id}>
                                {candidate.name} ({candidate.party})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="news-stats">
                <div className="stat-item">
                    <span className="stat-number">{filteredNews.length}</span>
                    <span className="stat-label">Articles</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredNews.filter(article => article.sentiment === 'positive').length}
                    </span>
                    <span className="stat-label">Positive</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredNews.filter(article => article.sentiment === 'negative').length}
                    </span>
                    <span className="stat-label">Negative</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredNews.filter(article => article.sentiment === 'neutral').length}
                    </span>
                    <span className="stat-label">Neutral</span>
                </div>
            </div>

            <div className="news-grid">
                {filteredNews.map(article => (
                    <div key={article.id} className="news-card">
                        <div className="news-card-header">
                            <div className="news-source">
                                <span className="source-name">{article.source}</span>
                                <span 
                                    className="sentiment-badge"
                                    style={{ backgroundColor: getSentimentColor(article.sentiment) }}
                                >
                                    {getSentimentIcon(article.sentiment)} {article.sentiment}
                                </span>
                            </div>
                            <div className="news-meta">
                                <span className="news-category">{article.category}</span>
                                <span className="news-date">{formatDate(article.published_at)}</span>
                            </div>
                        </div>
                        
                        <h3 className="news-title">{article.title}</h3>
                        <p className="news-content">{article.content}</p>
                        
                        <div className="news-footer">
                            <div className="candidate-info">
                                <span className="candidate-name">{article.candidate_name}</span>
                                <span className="candidate-party">({article.candidate_party})</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNews.length === 0 && (
                <div className="no-news">
                    <p>No news articles found with the current filters.</p>
                </div>
            )}
        </div>
    );
};

export default News; 