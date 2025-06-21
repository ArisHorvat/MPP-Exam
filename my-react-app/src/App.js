import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CandidateList from './components/CandidateList';
import CandidateDetail from './components/CandidateDetail';
import CandidateForm from './components/CandidateForm';
import PartyChart from './components/PartyChart';
import Login from './components/Login';
import Register from './components/Register';
import Voting from './components/Voting';
import News from './components/News';
import SocialMedia from './components/SocialMedia';
import apiService from './services/api';
import './App.css';

function App() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Check for existing user session on app load
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (err) {
                localStorage.removeItem('user');
            }
        }
    }, []);

    // Load initial data from backend
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const initialData = await apiService.getCandidates();
                setCandidates(initialData);
                setError(null);
            } catch (err) {
                console.error('Failed to load initial data:', err);
                setError('Failed to connect to server. Please check if the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Socket.IO event listeners
    useEffect(() => {
        // Listen for initial data from server
        apiService.onInitialData((data) => {
            setCandidates(data.candidates);
            setLoading(false);
        });

        // Listen for new candidates
        apiService.onCandidateAdded((data) => {
            setCandidates(prev => [...prev, data.candidate]);
        });

        // Listen for candidate updates
        apiService.onCandidateUpdated((data) => {
            setCandidates(prev => prev.map(c => 
                c.id === data.candidate.id ? data.candidate : c
            ));
        });

        // Listen for candidate deletions
        apiService.onCandidateDeleted((data) => {
            setCandidates(prev => prev.filter(c => c.id !== data.candidateId));
        });

        // Cleanup on unmount
        return () => {
            apiService.removeAllListeners();
        };
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const handleSaveCandidate = (candidateData) => {
        if (candidateData.id && candidates.find(c => c.id === candidateData.id)) {
            // Update existing candidate
            apiService.emitUpdateCandidate(candidateData);
        } else {
            // Add new candidate
            apiService.emitAddCandidate(candidateData);
        }
    };

    const handleDeleteCandidate = (candidateId) => {
        apiService.emitDeleteCandidate(candidateId);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading candidates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Connection Error</h2>
                <p>{error}</p>
                <p>Please make sure the backend server is running on port 5000.</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Public routes */}
                    <Route 
                        path="/login" 
                        element={
                            user ? <Navigate to="/voting" replace /> : <Login onLogin={handleLogin} />
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            user ? <Navigate to="/voting" replace /> : <Register onLogin={handleLogin} />
                        } 
                    />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/voting" 
                        element={
                            user ? <Voting user={user} /> : <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/" 
                        element={
                            <CandidateList 
                                candidates={candidates}
                                onSaveCandidate={handleSaveCandidate}
                                onDeleteCandidate={handleDeleteCandidate}
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/:id" 
                        element={
                            <CandidateDetail 
                                candidates={candidates}
                                onDeleteCandidate={handleDeleteCandidate}
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/add" 
                        element={
                            <CandidateForm 
                                candidates={candidates}
                                onSave={handleSaveCandidate}
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/edit/:id" 
                        element={
                            <CandidateForm 
                                candidates={candidates}
                                onSave={handleSaveCandidate}
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/chart" 
                        element={
                            <PartyChart 
                                candidates={candidates}
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/news" 
                        element={
                            <News 
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    <Route 
                        path="/social" 
                        element={
                            <SocialMedia 
                                user={user}
                                onLogout={handleLogout}
                            />
                        } 
                    />
                    
                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;