import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateAvatar from './CandidateAvatar';
import DeleteConfirmation from './DeleteConfirmation';
import './CandidateDetail.css';

function CandidateDetail({ candidates, onDeleteCandidate }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    
    const candidate = candidates.find(c => c.id === parseInt(id));

    const handleEdit = () => {
        navigate(`/candidate/edit/${id}`);
    };

    const handleDelete = () => {
        setDeleteCandidate(candidate);
    };

    const confirmDelete = (candidateId) => {
        onDeleteCandidate(candidateId);
        navigate('/');
    };

    const cancelDelete = () => {
        setDeleteCandidate(null);
    };

    if (!candidate) {
        return (
            <div className="candidate-detail-container">
                <h1>Candidate Not Found</h1>
                <button onClick={() => navigate('/')} className="back-button">
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <div className="candidate-detail-container">
            <div className="detail-header">
                <button onClick={() => navigate('/')} className="back-button">
                    ← Back to List
                </button>
                <div className="detail-actions">
                    <button onClick={handleEdit} className="edit-button">
                        ✏️ Edit
                    </button>
                    <button onClick={handleDelete} className="delete-button">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            
            <div className="candidate-detail-card">
                <div className="candidate-header">
                    <CandidateAvatar 
                        candidate={candidate} 
                        size={150}
                        className="candidate-detail-avatar"
                    />
                    <div className="candidate-info">
                        <h1>{candidate.name}</h1>
                        <h2>{candidate.party}</h2>
                    </div>
                </div>
                
                <div className="candidate-description">
                    <h3>About the Candidate</h3>
                    <p>{candidate.description}</p>
                </div>
                
                <div className="candidate-stats">
                    <div className="stat-item">
                        <span className="stat-label">Candidate ID:</span>
                        <span className="stat-value">{candidate.id}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Party Affiliation:</span>
                        <span className="stat-value">{candidate.party}</span>
                    </div>
                </div>
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

export default CandidateDetail;