import React, { useState, useEffect, useRef } from 'react';
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
    const generationInterval = useRef(null);

    // Available parties and their colors
    const parties = [
        "Democratic Party",
        "Republican Party", 
        "Independent",
        "Green Party",
        "Libertarian Party"
    ];

    const partyColors = {
        "Democratic Party": "#4CAF50",
        "Republican Party": "#2196F3",
        "Independent": "#FF9800",
        "Green Party": "#9C27B0",
        "Libertarian Party": "#F44336"
    };

    // Sample names for generating candidates
    const firstNames = [
        "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
        "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
        "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Nancy", "Daniel", "Lisa",
        "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra", "Donald", "Donna",
        "Steven", "Carol", "Paul", "Ruth", "Andrew", "Sharon", "Joshua", "Michelle"
    ];

    const lastNames = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
        "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
    ];

    // Calculate party statistics
    const calculatePartyStats = (candidateList) => {
        const stats = {};
        parties.forEach(party => {
            stats[party] = candidateList.filter(c => c.party === party).length;
        });
        return stats;
    };

    // Generate a random candidate
    const generateRandomCandidate = () => {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const party = parties[Math.floor(Math.random() * parties.length)];
        
        const descriptions = [
            "Experienced politician with strong community ties.",
            "Business leader with innovative policy ideas.",
            "Community activist focused on social justice.",
            "Former educator with progressive vision.",
            "Small business owner advocating for economic growth.",
            "Environmental advocate with sustainable policies.",
            "Healthcare professional with reform agenda.",
            "Technology expert with digital transformation plans.",
            "Veteran with national security expertise.",
            "Academic with research-based policy approach."
        ];
        
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        return {
            id: Date.now() + Math.random(),
            name: `${firstName} ${lastName}`,
            image: "", // Will use party icon
            party: party,
            description: description
        };
    };

    // Update party statistics when candidates change
    useEffect(() => {
        setPartyStats(calculatePartyStats(candidates));
    }, [candidates]);

    // Start generation thread
    const startGeneration = () => {
        if (isGenerating) return;
        
        setIsGenerating(true);
        console.log("Starting candidate generation...");
        
        generationInterval.current = setInterval(() => {
            const newCandidate = generateRandomCandidate();
            
            // Emit a custom event to simulate WebSocket update
            const event = new CustomEvent('candidateGenerated', {
                detail: { candidate: newCandidate }
            });
            window.dispatchEvent(event);
            
            console.log(`Generated candidate: ${newCandidate.name} (${newCandidate.party})`);
        }, 3000); // Generate every 3 seconds
    };

    // Stop generation thread
    const stopGeneration = () => {
        if (!isGenerating) return;
        
        setIsGenerating(false);
        if (generationInterval.current) {
            clearInterval(generationInterval.current);
            generationInterval.current = null;
        }
        
        console.log("Stopped candidate generation.");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (generationInterval.current) {
                clearInterval(generationInterval.current);
            }
        };
    }, []);

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