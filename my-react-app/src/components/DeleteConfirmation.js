import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ candidate, onConfirm, onCancel }) => {
    if (!candidate) return null;

    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal">
                <div className="delete-modal-header">
                    <h2>Delete Candidate</h2>
                </div>
                
                <div className="delete-modal-content">
                    <div className="warning-icon">⚠️</div>
                    <p>
                        Are you sure you want to delete <strong>{candidate.name}</strong>?
                    </p>
                    <p className="warning-text">
                        This action cannot be undone. All candidate information will be permanently removed.
                    </p>
                </div>
                
                <div className="delete-modal-actions">
                    <button onClick={onCancel} className="cancel-delete-btn">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(candidate.id)} className="confirm-delete-btn">
                        Delete Candidate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation; 