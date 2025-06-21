import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './CandidateForm.css';

const CandidateForm = ({ candidates, onSave, onCancel }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = id !== undefined;
    
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        party: '',
        description: ''
    });
    
    const [errors, setErrors] = useState({});

    // Available parties for the dropdown
    const availableParties = [
        'Democratic Party',
        'Republican Party', 
        'Independent',
        'Green Party',
        'Libertarian Party'
    ];

    // Load candidate data if editing
    useEffect(() => {
        if (isEditing) {
            const candidate = candidates.find(c => c.id === parseInt(id));
            if (candidate) {
                setFormData({
                    name: candidate.name,
                    image: candidate.image,
                    party: candidate.party,
                    description: candidate.description
                });
            }
        }
    }, [id, candidates, isEditing]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.party) {
            newErrors.party = 'Party is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        // Validate image URL if provided
        if (formData.image && !isValidUrl(formData.image)) {
            newErrors.image = 'Please enter a valid URL';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const candidateData = {
                ...formData,
                id: isEditing ? parseInt(id) : Date.now() // Use timestamp as ID for new candidates
            };
            
            onSave(candidateData);
            navigate('/');
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/');
        }
    };

    return (
        <div className="candidate-form-container">
            <div className="form-header">
                <h1>{isEditing ? 'Edit Candidate' : 'Add New Candidate'}</h1>
                <button onClick={handleCancel} className="cancel-button">
                    ← Back to List
                </button>
            </div>
            
            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Candidate Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? 'error' : ''}
                            placeholder="Enter candidate name"
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="party">Political Party *</label>
                        <select
                            id="party"
                            name="party"
                            value={formData.party}
                            onChange={handleInputChange}
                            className={errors.party ? 'error' : ''}
                        >
                            <option value="">Select a party</option>
                            {availableParties.map(party => (
                                <option key={party} value={party}>{party}</option>
                            ))}
                        </select>
                        {errors.party && <span className="error-message">{errors.party}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Profile Image URL</label>
                        <input
                            type="url"
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className={errors.image ? 'error' : ''}
                            placeholder="https://example.com/image.jpg (optional)"
                        />
                        {errors.image && <span className="error-message">{errors.image}</span>}
                        <small className="help-text">
                            Leave empty to use party icon. Must be a valid image URL.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={errors.description ? 'error' : ''}
                            placeholder="Enter candidate description and background"
                            rows="4"
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={handleCancel} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            {isEditing ? 'Update Candidate' : 'Add Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CandidateForm; 