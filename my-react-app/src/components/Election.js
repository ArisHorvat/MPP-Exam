import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './Election.css';

const Election = () => {
    const [electionResults, setElectionResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState('not-started'); // not-started, first-round, second-round, completed

    useEffect(() => {
        loadElectionResults();
    }, []);

    const loadElectionResults = async () => {
        try {
            const results = await apiService.getElectionResults();
            setElectionResults(results);
            
            // Determine simulation status
            if (results.secondRound && results.secondRound.length > 0) {
                setSimulationStatus('completed');
            } else if (results.firstRound && results.firstRound.length > 0) {
                setSimulationStatus('first-round');
            } else {
                setSimulationStatus('not-started');
            }
        } catch (error) {
            console.error('Error loading election results:', error);
        }
    };

    const handleSimulateFirstRound = async () => {
        try {
            setLoading(true);
            const results = await apiService.simulateFirstRound();
            setElectionResults(prev => ({
                ...prev,
                firstRound: results.firstRoundResults,
                topCandidates: results.topCandidates
            }));
            setSimulationStatus('first-round');
            alert('First round simulation completed! Check the results below.');
        } catch (error) {
            console.error('Error simulating first round:', error);
            alert('Error simulating first round. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateSecondRound = async () => {
        try {
            setLoading(true);
            const results = await apiService.simulateSecondRound();
            setElectionResults(prev => ({
                ...prev,
                secondRound: results.secondRoundResults
            }));
            setSimulationStatus('completed');
            alert(`Second round completed! Winner: ${results.winner.candidate_name} with ${results.winner.votes} votes`);
        } catch (error) {
            console.error('Error simulating second round:', error);
            alert('Error simulating second round. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetElection = async () => {
        if (window.confirm('Are you sure you want to reset the election? This will clear all results.')) {
            try {
                setLoading(true);
                await apiService.resetElection();
                setElectionResults(null);
                setSimulationStatus('not-started');
                alert('Election reset successfully!');
            } catch (error) {
                console.error('Error resetting election:', error);
                alert('Error resetting election. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'not-started': return '#666';
            case 'first-round': return '#ff9800';
            case 'second-round': return '#2196f3';
            case 'completed': return '#4caf50';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'not-started': return 'Not Started';
            case 'first-round': return 'First Round Completed';
            case 'second-round': return 'Second Round in Progress';
            case 'completed': return 'Election Completed';
            default: return 'Unknown';
        }
    };

    return (
        <div className="election-container">
            <div className="election-header">
                <h1>🗳️ Election Simulation</h1>
                <p>Two-round voting system with 100 random voters</p>
                <div className="election-status">
                    <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(simulationStatus) }}
                    >
                        {getStatusText(simulationStatus)}
                    </span>
                </div>
            </div>

            <div className="election-controls">
                <div className="control-buttons">
                    {simulationStatus === 'not-started' && (
                        <button 
                            onClick={handleSimulateFirstRound}
                            disabled={loading}
                            className="simulate-btn first-round-btn"
                        >
                            {loading ? 'Simulating...' : '🎯 Simulate First Round'}
                        </button>
                    )}
                    
                    {simulationStatus === 'first-round' && (
                        <button 
                            onClick={handleSimulateSecondRound}
                            disabled={loading}
                            className="simulate-btn second-round-btn"
                        >
                            {loading ? 'Simulating...' : '🏆 Simulate Second Round'}
                        </button>
                    )}
                    
                    <button 
                        onClick={handleResetElection}
                        disabled={loading}
                        className="reset-btn"
                    >
                        🔄 Reset Election
                    </button>
                </div>
            </div>

            {electionResults && (
                <div className="election-results">
                    {/* First Round Results */}
                    {electionResults.firstRound && electionResults.firstRound.length > 0 && (
                        <div className="results-section">
                            <h2>📊 First Round Results</h2>
                            <div className="results-grid">
                                {electionResults.firstRound.map((candidate, index) => (
                                    <div key={candidate.candidate_id} className="result-card">
                                        <div className="rank-badge" style={{ 
                                            backgroundColor: index < 2 ? '#4caf50' : '#ff9800' 
                                        }}>
                                            #{candidate.rank}
                                        </div>
                                        <h3>{candidate.candidate_name}</h3>
                                        <p className="party">{candidate.candidate_party}</p>
                                        <div className="vote-count">
                                            <span className="votes">{candidate.votes}</span>
                                            <span className="label">votes</span>
                                        </div>
                                        <div className="percentage">
                                            {((candidate.votes / 100) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Candidates for Second Round */}
                    {electionResults.topCandidates && electionResults.topCandidates.length > 0 && (
                        <div className="results-section">
                            <h2>🥇 Top 2 Candidates for Second Round</h2>
                            <div className="top-candidates">
                                {electionResults.topCandidates.map((candidate, index) => (
                                    <div key={candidate.candidate_id} className="top-candidate-card">
                                        <div className="position-badge">
                                            {index === 0 ? '🥇' : '🥈'}
                                        </div>
                                        <h3>{candidate.candidate_name}</h3>
                                        <p className="party">{candidate.candidate_party}</p>
                                        <div className="first-round-votes">
                                            <span className="votes">{candidate.first_round_votes}</span>
                                            <span className="label">first round votes</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Second Round Results */}
                    {electionResults.secondRound && electionResults.secondRound.length > 0 && (
                        <div className="results-section">
                            <h2>🏆 Final Results - Second Round</h2>
                            <div className="final-results">
                                {electionResults.secondRound.map((candidate, index) => (
                                    <div key={candidate.candidate_id} className={`final-result-card ${index === 0 ? 'winner' : 'runner-up'}`}>
                                        <div className="final-position">
                                            {index === 0 ? '👑 WINNER' : '🥈 Runner-up'}
                                        </div>
                                        <h3>{candidate.candidate_name}</h3>
                                        <p className="party">{candidate.candidate_party}</p>
                                        <div className="final-vote-count">
                                            <span className="votes">{candidate.votes}</span>
                                            <span className="label">votes</span>
                                        </div>
                                        <div className="final-percentage">
                                            {((candidate.votes / 100) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!electionResults && simulationStatus === 'not-started' && (
                <div className="no-results">
                    <p>No election results yet. Start the simulation to see results!</p>
                </div>
            )}
        </div>
    );
};

export default Election; 