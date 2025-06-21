import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './Voting.css';

const Voting = ({ user }) => {
    const [candidates, setCandidates] = useState([]);
    const [votingStats, setVotingStats] = useState({});
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
        setupSocketListeners();
    }, []);

    const loadData = async () => {
        try {
            const [candidatesData, statsData] = await Promise.all([
                apiService.getCandidates(),
                apiService.getVotingStats()
            ]);
            setCandidates(candidatesData);
            setVotingStats(statsData);
        } catch (err) {
            setError('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        apiService.onVoteSubmitted((data) => {
            setVotingStats(data.votingStats);
            if (data.vote.cnp === user.cnp) {
                setMessage(`Your vote for ${data.vote.candidateName} has been recorded!`);
                setSelectedCandidate(null);
            }
        });

        apiService.onCandidateAdded((data) => {
            setCandidates(prev => [...prev, data.candidate]);
        });

        apiService.onCandidateDeleted((data) => {
            setCandidates(prev => prev.filter(c => c.id !== data.candidateId));
            setVotingStats(data.votingStats);
        });
    };

    const handleVote = async () => {
        if (!selectedCandidate) return;

        setVoting(true);
        setError('');
        setMessage('');

        try {
            const response = await apiService.submitVote(user.cnp, selectedCandidate.id);
            
            if (response.error) {
                setError(response.error);
            } else {
                setMessage(`Successfully voted for ${response.vote.candidateName}!`);
                setSelectedCandidate(null);
            }
        } catch (err) {
            setError('Failed to submit vote. Please try again.');
        } finally {
            setVoting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="voting-container">
                <div className="loading-spinner"></div>
                <p>Loading candidates...</p>
            </div>
        );
    }

    return (
        <div className="voting-container">
            <div className="voting-header">
                <div className="user-info">
                    <h1>Voting System</h1>
                    <p>Welcome, {user.name} (CNP: {user.cnp})</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="voting-instructions">
                <h2>Select Your Candidate</h2>
                <p>Click on a candidate to select them, then click "Submit Vote"</p>
            </div>

            <div className="candidates-grid">
                {candidates.map(candidate => (
                    <div
                        key={candidate.id}
                        className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCandidate(candidate)}
                    >
                        <div className="candidate-image">
                            {candidate.image ? (
                                <img src={candidate.image} alt={candidate.name} />
                            ) : (
                                <div className="candidate-placeholder">
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}
                        </div>
                        <div className="candidate-info">
                            <h3>{candidate.name}</h3>
                            <p className="party">{candidate.party}</p>
                            <p className="description">{candidate.description}</p>
                            <div className="vote-count">
                                Votes: {votingStats[candidate.id] || 0}
                            </div>
                        </div>
                        {selectedCandidate?.id === candidate.id && (
                            <div className="selection-indicator">
                                ✓ Selected
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="voting-actions">
                <button
                    onClick={handleVote}
                    disabled={!selectedCandidate || voting}
                    className="vote-button"
                >
                    {voting ? 'Submitting Vote...' : 'Submit Vote'}
                </button>
            </div>

            <div className="voting-footer">
                <button onClick={() => navigate('/chart')} className="view-charts-btn">
                    View Party Charts
                </button>
                <button onClick={() => navigate('/')} className="view-candidates-btn">
                    View All Candidates
                </button>
            </div>
        </div>
    );
};

export default Voting; 