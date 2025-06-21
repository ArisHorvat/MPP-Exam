const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

// Store candidates and party statistics
let candidates = [
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

// Generate party statistics
function getPartyStats() {
    const stats = {};
    parties.forEach(party => {
        stats[party] = candidates.filter(c => c.party === party).length;
    });
    return stats;
}

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
        id: Date.now() + Math.random(),
        name: `${firstName} ${lastName}`,
        image: "", // Will use party icon
        party: party,
        description: description
    };
}

// Start candidate generation thread
function startGeneration() {
    if (isGenerating) return;
    
    isGenerating = true;
    console.log("Starting candidate generation...");
    
    generationThread = setInterval(() => {
        if (!isGenerating) return;
        
        const newCandidate = generateRandomCandidate();
        candidates.push(newCandidate);
        
        // Emit updates to all connected clients
        io.emit('candidateAdded', {
            candidate: newCandidate,
            partyStats: getPartyStats()
        });
        
        console.log(`Generated candidate: ${newCandidate.name} (${newCandidate.party})`);
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
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial data
    socket.emit('initialData', {
        candidates: candidates,
        partyStats: getPartyStats(),
        isGenerating: isGenerating
    });
    
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
    socket.on('addCandidate', (candidateData) => {
        const newCandidate = {
            ...candidateData,
            id: Date.now() + Math.random()
        };
        candidates.push(newCandidate);
        
        io.emit('candidateAdded', {
            candidate: newCandidate,
            partyStats: getPartyStats()
        });
    });
    
    socket.on('updateCandidate', (candidateData) => {
        const index = candidates.findIndex(c => c.id === candidateData.id);
        if (index !== -1) {
            candidates[index] = candidateData;
            
            io.emit('candidateUpdated', {
                candidate: candidateData,
                partyStats: getPartyStats()
            });
        }
    });
    
    socket.on('deleteCandidate', (candidateId) => {
        const index = candidates.findIndex(c => c.id === candidateId);
        if (index !== -1) {
            const deletedCandidate = candidates.splice(index, 1)[0];
            
            io.emit('candidateDeleted', {
                candidateId: candidateId,
                partyStats: getPartyStats()
            });
        }
    });
});

// REST API endpoints
app.get('/api/candidates', (req, res) => {
    res.json(candidates);
});

app.get('/api/party-stats', (req, res) => {
    res.json(getPartyStats());
});

app.get('/api/parties', (req, res) => {
    res.json(parties);
});

app.get('/api/party-colors', (req, res) => {
    res.json(partyColors);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready for real-time updates`);
}); 