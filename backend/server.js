const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { candidateService, userService, voteService, statsService } = require('./services/database');
const fakeNewsService = require('./services/fakeNewsGenerator');
const electionSimulator = require('./services/electionSimulator');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

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

// Thread control
let generationThread = null;
let isGenerating = false;

// Generate a random candidate
function generateRandomCandidate() {
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
        name: `${firstName} ${lastName}`,
        image: "", // Will use party icon
        party: party,
        description: description
    };
}

// Start candidate generation thread
async function startGeneration() {
    if (isGenerating) return;
    
    isGenerating = true;
    console.log("Starting candidate generation...");
    
    generationThread = setInterval(async () => {
        if (!isGenerating) return;
        
        try {
            const newCandidateData = generateRandomCandidate();
            const newCandidate = await candidateService.createCandidate(newCandidateData);
            
            // Get updated party stats
            const partyStats = await statsService.getPartyStats();
            const votingStats = await statsService.getVotingStats();
            
            // Emit updates to all connected clients
            io.emit('candidateAdded', {
                candidate: newCandidate,
                partyStats: partyStats,
                votingStats: votingStats
            });
            
            console.log(`Generated candidate: ${newCandidate.name} (${newCandidate.party})`);
        } catch (error) {
            console.error('Error generating candidate:', error);
        }
    }, 3000); // Generate every 3 seconds
}

// Stop candidate generation thread
function stopGeneration() {
    if (!isGenerating) return;
    
    isGenerating = false;
    if (generationThread) {
        clearInterval(generationThread);
        generationThread = null;
    }
    
    console.log("Stopped candidate generation.");
    io.emit('generationStopped');
}

// Socket.IO connection handling
io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);
    
    try {
        // Send initial data
        const [candidates, partyStats, votingStats] = await Promise.all([
            candidateService.getAllCandidates(),
            statsService.getPartyStats(),
            statsService.getVotingStats()
        ]);
        
        socket.emit('initialData', {
            candidates: candidates,
            partyStats: partyStats,
            votingStats: votingStats,
            isGenerating: isGenerating
        });
    } catch (error) {
        console.error('Error sending initial data:', error);
    }
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    
    // Handle start/stop generation requests
    socket.on('startGeneration', () => {
        startGeneration();
        io.emit('generationStarted');
    });
    
    socket.on('stopGeneration', () => {
        stopGeneration();
        io.emit('generationStopped');
    });
    
    // Handle CRUD operations
    socket.on('addCandidate', async (candidateData) => {
        try {
            const newCandidate = await candidateService.createCandidate(candidateData);
            
            const [partyStats, votingStats] = await Promise.all([
                statsService.getPartyStats(),
                statsService.getVotingStats()
            ]);
            
            io.emit('candidateAdded', {
                candidate: newCandidate,
                partyStats: partyStats,
                votingStats: votingStats
            });
        } catch (error) {
            console.error('Error adding candidate:', error);
            socket.emit('error', { message: 'Failed to add candidate' });
        }
    });
    
    socket.on('updateCandidate', async (candidateData) => {
        try {
            const updatedCandidate = await candidateService.updateCandidate(candidateData.id, candidateData);
            
            if (updatedCandidate) {
                const [partyStats, votingStats] = await Promise.all([
                    statsService.getPartyStats(),
                    statsService.getVotingStats()
                ]);
                
                io.emit('candidateUpdated', {
                    candidate: updatedCandidate,
                    partyStats: partyStats,
                    votingStats: votingStats
                });
            }
        } catch (error) {
            console.error('Error updating candidate:', error);
            socket.emit('error', { message: 'Failed to update candidate' });
        }
    });
    
    socket.on('deleteCandidate', async (candidateId) => {
        try {
            const deletedCandidate = await candidateService.deleteCandidate(candidateId);
            
            if (deletedCandidate) {
                const [partyStats, votingStats] = await Promise.all([
                    statsService.getPartyStats(),
                    statsService.getVotingStats()
                ]);
                
                io.emit('candidateDeleted', {
                    candidateId: candidateId,
                    partyStats: partyStats,
                    votingStats: votingStats
                });
            }
        } catch (error) {
            console.error('Error deleting candidate:', error);
            socket.emit('error', { message: 'Failed to delete candidate' });
        }
    });
});

// REST API endpoints
app.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await candidateService.getAllCandidates();
        res.json(candidates);
    } catch (error) {
        console.error('Error getting candidates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/party-stats', async (req, res) => {
    try {
        const stats = await statsService.getPartyStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting party stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/parties', (req, res) => {
    res.json(parties);
});

app.get('/api/party-colors', (req, res) => {
    res.json(partyColors);
});

app.get('/api/voting-stats', async (req, res) => {
    try {
        const stats = await statsService.getVotingStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting voting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/voting-results', async (req, res) => {
    try {
        const results = await voteService.getVotingResults();
        res.json(results);
    } catch (error) {
        console.error('Error getting voting results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's specific vote
app.get('/api/user-vote/:userCnp', async (req, res) => {
    try {
        const { userCnp } = req.params;
        
        // Get user's vote from database
        const voteResult = await pool.query(`
            SELECT v.candidate_id, v.candidate_name, v.candidate_party, v.created_at
            FROM votes v
            WHERE v.cnp = $1
            ORDER BY v.created_at DESC
            LIMIT 1
        `, [userCnp]);
        
        if (voteResult.rows.length === 0) {
            return res.json({ hasVoted: false });
        }
        
        const vote = voteResult.rows[0];
        res.json({
            hasVoted: true,
            candidate_id: vote.candidate_id,
            candidate_name: vote.candidate_name,
            candidate_party: vote.candidate_party,
            voted_at: vote.created_at
        });
        
    } catch (error) {
        console.error('Error getting user vote:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fake News API endpoints
app.get('/api/news', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const news = await fakeNewsService.getAllNews(limit);
        res.json(news);
    } catch (error) {
        console.error('Error getting news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/news/candidate/:candidateId', async (req, res) => {
    try {
        const candidateId = parseInt(req.params.candidateId);
        const limit = parseInt(req.query.limit) || 10;
        const news = await fakeNewsService.getNewsForCandidate(candidateId, limit);
        res.json(news);
    } catch (error) {
        console.error('Error getting candidate news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/social-posts/candidate/:candidateId', async (req, res) => {
    try {
        const candidateId = parseInt(req.params.candidateId);
        const limit = parseInt(req.query.limit) || 10;
        const posts = await fakeNewsService.getSocialPostsForCandidate(candidateId, limit);
        res.json(posts);
    } catch (error) {
        console.error('Error getting candidate social posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/news/generate/:candidateId', async (req, res) => {
    try {
        const candidateId = parseInt(req.params.candidateId);
        const newsArticle = await fakeNewsService.generateNewsForCandidate(candidateId);
        res.json(newsArticle);
    } catch (error) {
        console.error('Error generating news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/social/generate/:candidateId', async (req, res) => {
    try {
        const candidateId = parseInt(req.params.candidateId);
        const socialPost = await fakeNewsService.generateSocialPostForCandidate(candidateId);
        res.json(socialPost);
    } catch (error) {
        console.error('Error generating social post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/news/populate', async (req, res) => {
    try {
        await fakeNewsService.populateInitialNews();
        res.json({ message: 'Initial news and social media content generated successfully' });
    } catch (error) {
        console.error('Error populating news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Election Simulation endpoints
app.post('/api/election/simulate-first-round', async (req, res) => {
    try {
        const results = await electionSimulator.simulateAutomaticFirstRound();
        res.json(results);
    } catch (error) {
        console.error('Error simulating first round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/election/auto-vote-news', async (req, res) => {
    try {
        const { userCnp } = req.body;
        
        if (!userCnp) {
            return res.status(400).json({ error: 'User CNP is required' });
        }
        
        const results = await electionSimulator.autoVoteBasedOnNews(userCnp);
        res.json(results);
    } catch (error) {
        console.error('Error auto-voting based on news:', error);
        res.status(500).json({ error: error.message || 'Failed to auto-vote. Please try again.' });
    }
});

app.post('/api/election/simulate-second-round', async (req, res) => {
    try {
        const results = await electionSimulator.simulateAutomaticSecondRound();
        res.json(results);
    } catch (error) {
        console.error('Error simulating second round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/election/user-vote-second-round', async (req, res) => {
    try {
        const { userCnp, candidateId } = req.body;
        
        if (!userCnp || !candidateId) {
            return res.status(400).json({ error: 'User CNP and candidate ID are required' });
        }
        
        const results = await electionSimulator.handleUserSecondRoundVote(userCnp, candidateId);
        res.json(results);
    } catch (error) {
        console.error('Error handling user second round vote:', error);
        res.status(500).json({ error: error.message || 'Failed to process your vote. Please try again.' });
    }
});

app.get('/api/election/results', async (req, res) => {
    try {
        const results = await electionSimulator.getElectionResults();
        res.json(results);
    } catch (error) {
        console.error('Error getting election results:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/election/reset', async (req, res) => {
    try {
        await electionSimulator.resetElection();
        res.json({ message: 'Election simulation reset successfully' });
    } catch (error) {
        console.error('Error resetting election:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, cnp } = req.body;
        
        // Validate input
        if (!name || !cnp) {
            return res.status(400).json({ error: 'Name and CNP are required' });
        }
        
        // Validate CNP format (5 digits)
        if (!/^\d{5}$/.test(cnp)) {
            return res.status(400).json({ error: 'CNP must be exactly 5 digits' });
        }
        
        // Check if CNP already exists
        const existingUser = await userService.getUserByCnp(cnp);
        if (existingUser) {
            return res.status(400).json({ error: 'CNP already registered' });
        }
        
        // Create new user
        const newUser = await userService.createUser({ name, cnp });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            user: { id: newUser.id, name: newUser.name, cnp: newUser.cnp }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { cnp } = req.body;
        
        // Validate input
        if (!cnp) {
            return res.status(400).json({ error: 'CNP is required' });
        }
        
        // Find user by CNP
        const user = await userService.getUserByCnp(cnp);
        if (!user) {
            return res.status(401).json({ error: 'Invalid CNP' });
        }
        
        // Generate user preferences if they don't exist
        try {
            await fakeNewsService.generateInitialUserPreferences(cnp);
        } catch (error) {
            console.log('User preferences already exist or error generating them:', error.message);
        }
        
        res.json({ 
            message: 'Login successful',
            user: { id: user.id, name: user.name, cnp: user.cnp }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Submit vote
app.post('/api/vote', async (req, res) => {
    try {
        const { cnp, candidateId } = req.body;
        
        // Validate input
        if (!cnp || !candidateId) {
            return res.status(400).json({ error: 'CNP and candidate ID are required' });
        }
        
        // Find user by CNP
        const user = await userService.getUserByCnp(cnp);
        if (!user) {
            return res.status(401).json({ error: 'Invalid CNP' });
        }
        
        // Check if candidate exists
        const candidate = await candidateService.getCandidateById(candidateId);
        if (!candidate) {
            return res.status(400).json({ error: 'Invalid candidate ID' });
        }
        
        // Check if user already voted (database constraint will also prevent this)
        const existingVote = await voteService.getVoteByCnp(cnp);
        if (existingVote) {
            return res.status(400).json({ error: 'User has already voted' });
        }
        
        // Create vote
        const vote = await voteService.createVote({
            cnp,
            candidateId,
            candidateName: candidate.name,
            candidateParty: candidate.party
        });
        
        // Get updated voting stats
        const votingStats = await statsService.getVotingStats();
        
        // Emit voting update to all clients
        io.emit('voteSubmitted', {
            vote,
            votingStats: votingStats
        });
        
        res.json({ 
            message: 'Vote submitted successfully',
            vote: { candidateName: candidate.name, candidateParty: candidate.party }
        });
        
    } catch (error) {
        console.error('Voting error:', error);
        
        // Check if it's a unique constraint violation
        if (error.code === '23505' && error.constraint === 'votes_cnp_key') {
            return res.status(400).json({ error: 'User has already voted' });
        }
        
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User-targeted news endpoints
app.get('/api/user-targeted-news/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        const limit = parseInt(req.query.limit) || 10;
        const news = await fakeNewsService.getUserTargetedNews(userCnp, limit);
        res.json(news);
    } catch (error) {
        console.error('Error getting user-targeted news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user-targeted-news/:userCnp/candidate/:candidateId', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        const candidateId = parseInt(req.params.candidateId);
        const limit = parseInt(req.query.limit) || 5;
        const news = await fakeNewsService.getUserTargetedNewsForCandidate(userCnp, candidateId, limit);
        res.json(news);
    } catch (error) {
        console.error('Error getting user-targeted news for candidate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-targeted-news/generate/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        const { candidateId, sentiment } = req.body;
        
        if (!candidateId) {
            return res.status(400).json({ error: 'Candidate ID is required' });
        }
        
        const news = await fakeNewsService.generateUserTargetedNews(userCnp, candidateId, sentiment);
        res.json(news);
    } catch (error) {
        console.error('Error generating user-targeted news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-preferences/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        const { candidateId, preferenceType, strength } = req.body;
        
        if (!candidateId || !preferenceType) {
            return res.status(400).json({ error: 'Candidate ID and preference type are required' });
        }
        
        const preference = await fakeNewsService.updateUserPreference(userCnp, candidateId, preferenceType, strength);
        res.json(preference);
    } catch (error) {
        console.error('Error updating user preference:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user-preferences/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        const preferences = await fakeNewsService.getUserPreferences(userCnp);
        res.json(preferences);
    } catch (error) {
        console.error('Error getting user preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-preferences/generate/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        await fakeNewsService.generateInitialUserPreferences(userCnp);
        res.json({ message: 'User preferences generated successfully' });
    } catch (error) {
        console.error('Error generating user preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-targeted-news/mark-read/:newsId', async (req, res) => {
    try {
        const newsId = parseInt(req.params.newsId);
        const { userCnp } = req.body;
        
        if (!userCnp) {
            return res.status(400).json({ error: 'User CNP is required' });
        }
        
        const news = await fakeNewsService.markNewsAsRead(newsId, userCnp);
        res.json(news);
    } catch (error) {
        console.error('Error marking news as read:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/user-targeted-news/generate-all', async (req, res) => {
    try {
        await fakeNewsService.generateTargetedNewsForAllUsers();
        res.json({ message: 'Targeted news generated for all users' });
    } catch (error) {
        console.error('Error generating targeted news for all users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/user-targeted-news/clear/:userCnp', async (req, res) => {
    try {
        const userCnp = req.params.userCnp;
        await fakeNewsService.clearUserTargetedNews(userCnp);
        res.json({ message: 'User targeted news cleared successfully' });
    } catch (error) {
        console.error('Error clearing user targeted news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready for real-time updates`);
    console.log(`Database connection established`);
}); 