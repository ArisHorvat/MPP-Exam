import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './Login.css';

const Register = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [cnp, setCnp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.register(name, cnp);
            
            if (response.error) {
                setError(response.error);
            } else {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));
                onLogin(response.user);
                navigate('/candidates');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Register with your name and CNP to start voting</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cnp">CNP (5 digits)</label>
                        <input
                            type="text"
                            id="cnp"
                            value={cnp}
                            onChange={(e) => setCnp(e.target.value)}
                            placeholder="Enter your 5-digit CNP"
                            maxLength="5"
                            pattern="[0-9]{5}"
                            required
                            disabled={loading}
                        />
                        <small>CNP must be exactly 5 digits and unique</small>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={loading || !name || !cnp}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account?</p>
                    <button 
                        onClick={handleLoginClick}
                        className="auth-button secondary"
                        disabled={loading}
                    >
                        Login Instead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register; 