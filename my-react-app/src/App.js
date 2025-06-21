import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateList from './components/CandidateList';
import CandidateDetail from './components/CandidateDetail';
import CandidateForm from './components/CandidateForm';
import PartyChart from './components/PartyChart';
import './App.css';

// Initial sample data
const initialCandidates = [
    {
        id: 1,
        name: "John Smith",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        party: "Democratic Party",
        description: "Experienced politician with 10 years in public service. Focuses on healthcare reform and environmental protection."
    },
    {
        id: 2,
        name: "Sarah Johnson",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
        party: "Republican Party",
        description: "Business leader and former mayor. Advocates for economic growth and tax reform."
    },
    {
        id: 3,
        name: "Michael Chen",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        party: "Independent",
        description: "Community activist and educator. Campaigns for education reform and social justice."
    },
    {
        id: 4,
        name: "Emily Davis",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
        party: "Green Party",
        description: "Environmental scientist and climate advocate. Focuses on renewable energy and sustainability."
    },
    {
        id: 5,
        name: "David Wilson",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
        party: "Libertarian Party",
        description: "Small business owner and constitutional advocate. Promotes individual freedoms and limited government."
    }
];

function App() {
    const [candidates, setCandidates] = useState(initialCandidates);

    // Listen for generated candidates from the chart component
    useEffect(() => {
        const handleCandidateGenerated = (event) => {
            const { candidate } = event.detail;
            setCandidates(prev => [...prev, candidate]);
        };

        window.addEventListener('candidateGenerated', handleCandidateGenerated);

        return () => {
            window.removeEventListener('candidateGenerated', handleCandidateGenerated);
        };
    }, []);

    const handleSaveCandidate = (candidateData) => {
        if (candidateData.id && candidates.find(c => c.id === candidateData.id)) {
            // Update existing candidate
            setCandidates(prev => prev.map(c => 
                c.id === candidateData.id ? candidateData : c
            ));
        } else {
            // Add new candidate
            const newCandidate = {
                ...candidateData,
                id: Date.now() // Use timestamp as ID for new candidates
            };
            setCandidates(prev => [...prev, newCandidate]);
        }
    };

    const handleDeleteCandidate = (candidateId) => {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
    };

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