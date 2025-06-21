import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
    const [cnp, setCnp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.login(cnp);
            
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

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Login with your CNP to access the voting system</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={loading || !cnp}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account?</p>
                    <button 
                        onClick={handleRegisterClick}
                        className="auth-button secondary"
                        disabled={loading}
                    >
                        Register Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login; 