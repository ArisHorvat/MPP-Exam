import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './Election.css';

const Election = ({ user }) => {
    const [electionResults, setElectionResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [simulationStatus, setSimulationStatus] = useState('not-started'); // not-started, first-round-auto, first-round-voting, second-round-auto, second-round-voting, completed
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showVotingInterface, setShowVotingInterface] = useState(false);

    useEffect(() => {
        loadElectionResults();
        loadCandidates();
    }, []);

    const loadElectionResults = async () => {
        try {
            const results = await apiService.getElectionResults();
            setElectionResults(results);
            
            // Determine simulation status
            if (results.secondRound && results.secondRound.length > 0) {
                setSimulationStatus('completed');
            } else if (results.firstRound && results.firstRound.length > 0) {
                setSimulationStatus('first-round-voting');
            } else {
                setSimulationStatus('not-started');
            }
        } catch (error) {
            console.error('Error loading election results:', error);
        }
    };

    const loadCandidates = async () => {
        try {
            const data = await apiService.getCandidates();
            setCandidates(data);
        } catch (error) {
            console.error('Error loading candidates:', error);
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
            setSimulationStatus('second-round-auto');
            alert('First round completed! 90 automatic votes + your auto-vote based on news preferences have been cast. Top 2 candidates advance to second round.');
            
            // Automatically start second round
            setTimeout(() => {
                handleSimulateSecondRound();
            }, 1000);
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
            setSimulationStatus('second-round-voting');
            setShowVotingInterface(true);
            alert('90 automatic votes have been cast in the second round! Now cast your vote to determine the winner.');
        } catch (error) {
            console.error('Error simulating second round:', error);
            alert('Error simulating second round. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUserVoteSecondRound = async () => {
        if (!selectedCandidate) {
            alert('Please select a candidate to vote for.');
            return;
        }

        if (!user || !user.cnp) {
            alert('Please log in to vote.');
            return;
        }

        try {
            setLoading(true);
            const results = await apiService.userVoteSecondRound(user.cnp, selectedCandidate);
            
            if (results.error) {
                alert(`Error: ${results.error}`);
                return;
            }
            
            setElectionResults(prev => ({
                ...prev,
                secondRound: results.secondRoundResults
            }));
            setSimulationStatus('completed');
            setShowVotingInterface(false);
            setSelectedCandidate(null);
            alert(`🎉 ELECTION COMPLETED! ${results.winner.candidate_name} wins with ${results.winner.votes} votes!`);
        } catch (error) {
            console.error('Error voting in second round:', error);
            alert(`Error casting your vote: ${error.message || 'Please try again.'}`);
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
                setShowVotingInterface(false);
                setSelectedCandidate(null);
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
            case 'first-round-auto': return '#ff9800';
            case 'first-round-voting': return '#ff5722';
            case 'second-round-auto': return '#2196f3';
            case 'second-round-voting': return '#1976d2';
            case 'completed': return '#4caf50';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'not-started': return 'Not Started';
            case 'first-round-auto': return 'First Round - Automatic Voting';
            case 'first-round-voting': return 'First Round - Automatic (No Manual Voting)';
            case 'second-round-auto': return 'Second Round - Automatic Voting';
            case 'second-round-voting': return 'Second Round - Your Turn to Vote!';
            case 'completed': return 'Election Completed';
            default: return 'Unknown';
        }
    };

    const getVotingCandidates = () => {
        if (simulationStatus === 'second-round-voting' && electionResults?.topCandidates) {
            return electionResults.topCandidates.map(candidate => ({
                id: candidate.candidate_id,
                name: candidate.candidate_name,
                party: candidate.candidate_party
            }));
        }
        return [];
    };

    return (
        <div className="election-container">
            <div className="election-header">
                <h1>🗳️ Interactive Election Simulation</h1>
                <p>First Round: 90 automatic votes + your auto-vote based on news preferences</p>
                <p>Second Round: 90 automatic votes + your manual vote for the top 2 candidates</p>
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
                            {loading ? 'Simulating...' : '🎯 Start First Round (90 Auto + 1 Auto User Vote)'}
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

            {/* Voting Interface */}
            {showVotingInterface && (
                <div className="voting-interface">
                    <div className="voting-header">
                        <h2>🗳️ Cast Your Vote for Second Round</h2>
                        <p>Choose between the top 2 candidates from the first round!</p>
                    </div>
                    
                    <div className="candidates-grid">
                        {getVotingCandidates().map(candidate => (
                            <div 
                                key={candidate.id} 
                                className={`candidate-option ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                                onClick={() => setSelectedCandidate(candidate.id)}
                            >
                                <h3>{candidate.name}</h3>
                                <p className="party">{candidate.party}</p>
                                {selectedCandidate === candidate.id && (
                                    <div className="selected-indicator">✓ Selected</div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="voting-actions">
                        <button 
                            onClick={handleUserVoteSecondRound}
                            disabled={!selectedCandidate || loading}
                            className="vote-btn"
                        >
                            {loading ? 'Casting Vote...' : '🗳️ Cast My Vote'}
                        </button>
                    </div>
                </div>
            )}

            {electionResults && (
                <div className="election-results">
                    {/* First Round Results */}
                    {electionResults.firstRound && electionResults.firstRound.length > 0 && (
                        <div className="results-section">
                            <h2>📊 First Round Results (101 votes total)</h2>
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
                                            {((candidate.votes / 101) * 100).toFixed(1)}%
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
                            <h2>🏆 Final Results - Second Round (101 votes total)</h2>
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
                                            {((candidate.votes / 101) * 100).toFixed(1)}%
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