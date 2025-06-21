import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Candidate } from '../domain/Candidate';
import CandidateAvatar from './CandidateAvatar';
import DeleteConfirmation from './DeleteConfirmation';
import './CandidateList.css';

function CandidateList({ candidates, onSaveCandidate, onDeleteCandidate, user, onLogout }) {
    const navigate = useNavigate();
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const handleCandidateClick = (candidateId) => {
        navigate(`/candidate/${candidateId}`);
    };

    const handleAddCandidate = () => {
        navigate('/candidate/add');
    };

    const handleEditCandidate = (e, candidateId) => {
        e.stopPropagation(); // Prevent row click
        navigate(`/candidate/edit/${candidateId}`);
    };

    const handleDeleteCandidate = (e, candidate) => {
        e.stopPropagation(); // Prevent row click
        setDeleteCandidate(candidate);
    };

    const handleViewChart = () => {
        navigate('/chart');
    };

    const handleVoting = () => {
        navigate('/voting');
    };

    const handleNews = () => {
        navigate('/news');
    };

    const handleSocial = () => {
        navigate('/social');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const confirmDelete = (candidateId) => {
        onDeleteCandidate(candidateId);
        setDeleteCandidate(null);
    };

    const cancelDelete = () => {
        setDeleteCandidate(null);
    };

    return (
        <div className="candidate-list-container">
            <div className="list-header">
                <div className="header-left">
                    <h1>Election Candidates</h1>
                    {user && (
                        <div className="user-info">
                            <span>Welcome, {user.name}</span>
                            <button onClick={onLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    {user ? (
                        <button onClick={handleVoting} className="voting-btn">
                            🗳️ Vote Now
                        </button>
                    ) : (
                        <button onClick={handleLogin} className="login-btn">
                            🔐 Login to Vote
                        </button>
                    )}
                    <button onClick={handleNews} className="news-btn">
                        📰 News
                    </button>
                    <button onClick={handleSocial} className="social-btn">
                        📱 Social Media
                    </button>
                    <button onClick={handleViewChart} className="chart-btn">
                        📊 View Chart
                    </button>
                    <button onClick={handleAddCandidate} className="add-candidate-btn">
                        + Add Candidate
                    </button>
                </div>
            </div>
            
            <div className="table-container">
                <table className="candidate-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Party</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((candidate) => (
                            <tr 
                                key={candidate.id} 
                                onClick={() => handleCandidateClick(candidate.id)}
                                className="candidate-row"
                            >
                                <td>
                                    <CandidateAvatar 
                                        candidate={candidate} 
                                        size={80}
                                        className="candidate-avatar"
                                    />
                                </td>
                                <td className="candidate-name">{candidate.name}</td>
                                <td className="candidate-party">{candidate.party}</td>
                                <td className="candidate-actions">
                                    <button 
                                        onClick={(e) => handleEditCandidate(e, candidate.id)}
                                        className="edit-btn"
                                        title="Edit candidate"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteCandidate(e, candidate)}
                                        className="delete-btn"
                                        title="Delete candidate"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {deleteCandidate && (
                <DeleteConfirmation
                    candidate={deleteCandidate}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}

export default CandidateList;