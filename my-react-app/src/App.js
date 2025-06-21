import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateList from './components/CandidateList';
import CandidateDetail from './components/CandidateDetail';
import CandidateForm from './components/CandidateForm';
import PartyChart from './components/PartyChart';
import apiService from './services/api';
import './App.css';

function App() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    <Route 
                        path="/" 
                        element={
                            <CandidateList 
                                candidates={candidates}
                                onSaveCandidate={handleSaveCandidate}
                                onDeleteCandidate={handleDeleteCandidate}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/:id" 
                        element={
                            <CandidateDetail 
                                candidates={candidates}
                                onDeleteCandidate={handleDeleteCandidate}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/add" 
                        element={
                            <CandidateForm 
                                candidates={candidates}
                                onSave={handleSaveCandidate}
                            />
                        } 
                    />
                    <Route 
                        path="/candidate/edit/:id" 
                        element={
                            <CandidateForm 
                                candidates={candidates}
                                onSave={handleSaveCandidate}
                            />
                        } 
                    />
                    <Route 
                        path="/chart" 
                        element={
                            <PartyChart 
                                candidates={candidates}
                            />
                        } 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;