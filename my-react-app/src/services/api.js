import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000';
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