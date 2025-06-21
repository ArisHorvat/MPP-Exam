import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import apiService from '../services/api';
import './PartyChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const PartyChart = ({ candidates }) => {
    const navigate = useNavigate();
    const [partyStats, setPartyStats] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'doughnut'
    const [parties, setParties] = useState([]);
    const [partyColors, setPartyColors] = useState({});

    // Load parties and colors from backend
    useEffect(() => {
        const loadPartyData = async () => {
            try {
                const [partiesData, colorsData] = await Promise.all([
                    apiService.getParties(),
                    apiService.getPartyColors()
                ]);
                setParties(partiesData);
                setPartyColors(colorsData);
            } catch (err) {
                console.error('Failed to load party data:', err);
            }
        };

        loadPartyData();
    }, []);

    // Calculate party statistics
    const calculatePartyStats = (candidateList) => {
        const stats = {};
        parties.forEach(party => {
            stats[party] = candidateList.filter(c => c.party === party).length;
        });
        return stats;
    };

    // Update party statistics when candidates change
    useEffect(() => {
        setPartyStats(calculatePartyStats(candidates));
    }, [candidates, parties]);

    // Socket.IO event listeners for generation control
    useEffect(() => {
        // Listen for generation status updates
        apiService.onGenerationStarted(() => {
            setIsGenerating(true);
        });

        apiService.onGenerationStopped(() => {
            setIsGenerating(false);
        });

        // Listen for new candidates from generation
        apiService.onCandidateAdded((data) => {
            // The candidates prop will be updated by the parent component
            // We just need to update our local party stats
            setPartyStats(data.partyStats);
        });

        // Cleanup
        return () => {
            // Note: We don't remove all listeners here as they might be used by other components
            // The cleanup is handled in the main App component
        };
    }, []);

    // Start generation
    const startGeneration = () => {
        if (isGenerating) return;
        apiService.emitStartGeneration();
    };

    // Stop generation
    const stopGeneration = () => {
        if (!isGenerating) return;
        apiService.emitStopGeneration();
    };

    // Chart data configuration
    const chartData = {
        labels: parties,
        datasets: [
            {
                label: 'Number of Candidates',
                data: parties.map(party => partyStats[party] || 0),
                backgroundColor: parties.map(party => partyColors[party]),
                borderColor: parties.map(party => partyColors[party]),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            title: {
                display: true,
                text: 'Candidate Distribution by Political Party',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const total = Object.values(partyStats).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : 0;
                        return `${context.parsed.y} candidates (${percentage}%)`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12
                    }
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            title: {
                display: true,
                text: 'Candidate Distribution by Political Party',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        const total = Object.values(partyStats).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                        return `${context.parsed} candidates (${percentage}%)`;
                    }
                }
            }
        }
    };

    const totalCandidates = Object.values(partyStats).reduce((a, b) => a + b, 0);

    return (
        <div className="party-chart-container">
            <div className="chart-header">
                <div className="header-left">
                    <button onClick={() => navigate('/')} className="back-btn">
                        ← Back to Candidates
                    </button>
                    <h1>Party Statistics Dashboard</h1>
                </div>
                <div className="chart-controls">
                    <div className="chart-type-selector">
                        <button 
                            className={chartType === 'bar' ? 'active' : ''}
                            onClick={() => setChartType('bar')}
                        >
                            📊 Bar Chart
                        </button>
                        <button 
                            className={chartType === 'doughnut' ? 'active' : ''}
                            onClick={() => setChartType('doughnut')}
                        >
                            🍩 Doughnut Chart
                        </button>
                    </div>
                    <div className="generation-controls">
                        <button 
                            onClick={startGeneration}
                            disabled={isGenerating}
                            className="start-btn"
                        >
                            ▶️ Start Generation
                        </button>
                        <button 
                            onClick={stopGeneration}
                            disabled={!isGenerating}
                            className="stop-btn"
                        >
                            ⏹️ Stop Generation
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <h3>Total Candidates</h3>
                    <span className="stat-number">{totalCandidates}</span>
                </div>
                <div className="stat-card">
                    <h3>Active Parties</h3>
                    <span className="stat-number">
                        {Object.values(partyStats).filter(count => count > 0).length}
                    </span>
                </div>
                <div className="stat-card">
                    <h3>Generation Status</h3>
                    <span className={`status-indicator ${isGenerating ? 'active' : 'inactive'}`}>
                        {isGenerating ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                </div>
            </div>

            <div className="chart-wrapper">
                {chartType === 'bar' ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <Doughnut data={chartData} options={doughnutOptions} />
                )}
            </div>

            <div className="party-breakdown">
                <h3>Detailed Party Breakdown</h3>
                <div className="party-list">
                    {parties.map(party => (
                        <div key={party} className="party-item">
                            <div 
                                className="party-color-indicator" 
                                style={{ backgroundColor: partyColors[party] }}
                            ></div>
                            <span className="party-name">{party}</span>
                            <span className="party-count">{partyStats[party] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PartyChart; 