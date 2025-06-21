import io from 'socket.io-client';

const API_BASE_URL = 'https://mpp-exam-production-d367.up.railway.app';
const socket = io(API_BASE_URL);

class ApiService {
    constructor() {
        this.socket = socket;
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        // Socket event listeners will be set up by components
    }

    // REST API methods
    async getCandidates() {
        const response = await fetch(`${API_BASE_URL}/api/candidates`);
        return response.json();
    }

    async getPartyStats() {
        const response = await fetch(`${API_BASE_URL}/api/party-stats`);
        return response.json();
    }

    async getParties() {
        const response = await fetch(`${API_BASE_URL}/api/parties`);
        return response.json();
    }

    async getPartyColors() {
        const response = await fetch(`${API_BASE_URL}/api/party-colors`);
        return response.json();
    }

    async getVotingStats() {
        const response = await fetch(`${API_BASE_URL}/api/voting-stats`);
        return response.json();
    }

    async getVotingResults() {
        const response = await fetch(`${API_BASE_URL}/api/voting-results`);
        return response.json();
    }

    // Authentication methods
    async register(name, cnp) {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, cnp }),
        });
        return response.json();
    }

    async login(cnp) {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cnp }),
        });
        return response.json();
    }

    // Voting methods
    async submitVote(cnp, candidateId) {
        const response = await fetch(`${API_BASE_URL}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cnp, candidateId }),
        });
        return response.json();
    }

    // News methods
    async getNews(limit = 100) {
        const response = await fetch(`${API_BASE_URL}/api/news?limit=${limit}`);
        return response.json();
    }

    async getNewsForCandidate(candidateId, limit = 10) {
        const response = await fetch(`${API_BASE_URL}/api/news/candidate/${candidateId}?limit=${limit}`);
        return response.json();
    }

    async generateNewsForCandidate(candidateId) {
        const response = await fetch(`${API_BASE_URL}/api/news/generate/${candidateId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    async populateNews() {
        const response = await fetch(`${API_BASE_URL}/api/news/populate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    // Social Media methods
    async getSocialPostsForCandidate(candidateId, limit = 20) {
        const response = await fetch(`${API_BASE_URL}/api/social-posts/candidate/${candidateId}?limit=${limit}`);
        return response.json();
    }

    async generateSocialPostForCandidate(candidateId) {
        const response = await fetch(`${API_BASE_URL}/api/social/generate/${candidateId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    // Election Simulation methods
    async simulateFirstRound() {
        const response = await fetch(`${API_BASE_URL}/api/election/simulate-first-round`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    async simulateSecondRound() {
        const response = await fetch(`${API_BASE_URL}/api/election/simulate-second-round`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    async getElectionResults() {
        const response = await fetch(`${API_BASE_URL}/api/election/results`);
        return response.json();
    }

    async resetElection() {
        const response = await fetch(`${API_BASE_URL}/api/election/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    }

    // Socket.IO methods
    onInitialData(callback) {
        this.socket.on('initialData', callback);
    }

    onCandidateAdded(callback) {
        this.socket.on('candidateAdded', callback);
    }

    onCandidateUpdated(callback) {
        this.socket.on('candidateUpdated', callback);
    }

    onCandidateDeleted(callback) {
        this.socket.on('candidateDeleted', callback);
    }

    onGenerationStarted(callback) {
        this.socket.on('generationStarted', callback);
    }

    onGenerationStopped(callback) {
        this.socket.on('generationStopped', callback);
    }

    onVoteSubmitted(callback) {
        this.socket.on('voteSubmitted', callback);
    }

    // Emit methods
    emitAddCandidate(candidateData) {
        this.socket.emit('addCandidate', candidateData);
    }

    emitUpdateCandidate(candidateData) {
        this.socket.emit('updateCandidate', candidateData);
    }

    emitDeleteCandidate(candidateId) {
        this.socket.emit('deleteCandidate', candidateId);
    }

    emitStartGeneration() {
        this.socket.emit('startGeneration');
    }

    emitStopGeneration() {
        this.socket.emit('stopGeneration');
    }

    // Cleanup
    disconnect() {
        this.socket.disconnect();
    }

    removeAllListeners() {
        this.socket.removeAllListeners();
    }
}

export default new ApiService(); 