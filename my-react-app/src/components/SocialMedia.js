import React, { useState, useEffect } from 'react';
import './SocialMedia.css';

const SocialMedia = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        fetchSocialPosts();
        fetchCandidates();
    }, []);

    const fetchSocialPosts = async () => {
        try {
            // Fetch posts from all candidates
            const response = await fetch('http://localhost:5000/api/candidates');
            const candidates = await response.json();
            
            const allPosts = [];
            for (const candidate of candidates) {
                const postsResponse = await fetch(`http://localhost:5000/api/social-posts/candidate/${candidate.id}?limit=20`);
                const candidatePosts = await postsResponse.json();
                allPosts.push(...candidatePosts);
            }
            
            // Sort by posted_at (newest first)
            allPosts.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
            setPosts(allPosts);
        } catch (error) {
            console.error('Error fetching social posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/candidates');
            const data = await response.json();
            setCandidates(data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'twitter': return '🐦';
            case 'facebook': return '📘';
            case 'instagram': return '📷';
            case 'linkedin': return '💼';
            default: return '📱';
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'twitter': return '#1DA1F2';
            case 'facebook': return '#4267B2';
            case 'instagram': return '#E4405F';
            case 'linkedin': return '#0077B5';
            default: return '#666';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const filteredPosts = posts.filter(post => {
        const matchesCandidate = selectedCandidate === 'all' || post.candidate_id === parseInt(selectedCandidate);
        const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform;
        return matchesCandidate && matchesPlatform;
    });

    if (loading) {
        return (
            <div className="social-container">
                <div className="loading">Loading social media posts...</div>
            </div>
        );
    }

    return (
        <div className="social-container">
            <div className="social-header">
                <h1>📱 Social Media Feed</h1>
                <p>See what candidates are saying on social media</p>
            </div>

            <div className="social-filters">
                <div className="filter-group">
                    <label>Platform:</label>
                    <select 
                        value={selectedPlatform} 
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Platforms</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
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

            <div className="social-stats">
                <div className="stat-item">
                    <span className="stat-number">{filteredPosts.length}</span>
                    <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredPosts.reduce((sum, post) => sum + post.likes, 0).toLocaleString()}
                    </span>
                    <span className="stat-label">Total Likes</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredPosts.reduce((sum, post) => sum + post.shares, 0).toLocaleString()}
                    </span>
                    <span className="stat-label">Total Shares</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {filteredPosts.reduce((sum, post) => sum + post.comments, 0).toLocaleString()}
                    </span>
                    <span className="stat-label">Total Comments</span>
                </div>
            </div>

            <div className="social-feed">
                {filteredPosts.map(post => (
                    <div key={post.id} className="social-post">
                        <div className="post-header">
                            <div className="post-meta">
                                <div className="platform-badge" style={{ backgroundColor: getPlatformColor(post.platform) }}>
                                    {getPlatformIcon(post.platform)} {post.platform}
                                </div>
                                <span className="post-time">{formatDate(post.posted_at)}</span>
                            </div>
                        </div>
                        
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>
                        
                        <div className="post-stats">
                            <div className="stat">
                                <span className="stat-icon">❤️</span>
                                <span className="stat-value">{formatNumber(post.likes)}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-icon">🔄</span>
                                <span className="stat-value">{formatNumber(post.shares)}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-icon">💬</span>
                                <span className="stat-value">{formatNumber(post.comments)}</span>
                            </div>
                        </div>
                        
                        <div className="post-footer">
                            <div className="candidate-info">
                                <span className="candidate-name">
                                    {candidates.find(c => c.id === post.candidate_id)?.name || 'Unknown'}
                                </span>
                                <span className="candidate-party">
                                    ({candidates.find(c => c.id === post.candidate_id)?.party || 'Unknown'})
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="no-posts">
                    <p>No social media posts found with the current filters.</p>
                </div>
            )}
        </div>
    );
};

export default SocialMedia; 