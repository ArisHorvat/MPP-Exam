const pool = require('../config/database');

// Candidate operations
const candidateService = {
    async getAllCandidates() {
        const query = 'SELECT * FROM candidates ORDER BY id';
        const result = await pool.query(query);
        return result.rows;
    },

    async getCandidateById(id) {
        const query = 'SELECT * FROM candidates WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    async createCandidate(candidateData) {
        const { name, image, party, description } = candidateData;
        const query = `
            INSERT INTO candidates (name, image, party, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [name, image, party, description]);
        return result.rows[0];
    },

    async updateCandidate(id, candidateData) {
        const { name, image, party, description } = candidateData;
        const query = `
            UPDATE candidates 
            SET name = $1, image = $2, party = $3, description = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const result = await pool.query(query, [name, image, party, description, id]);
        return result.rows[0];
    },

    async deleteCandidate(id) {
        const query = 'DELETE FROM candidates WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
};

// User operations
const userService = {
    async getUserByCnp(cnp) {
        const query = 'SELECT * FROM users WHERE cnp = $1';
        const result = await pool.query(query, [cnp]);
        return result.rows[0];
    },

    async createUser(userData) {
        const { name, cnp } = userData;
        const query = `
            INSERT INTO users (name, cnp)
            VALUES ($1, $2)
            RETURNING *
        `;
        const result = await pool.query(query, [name, cnp]);
        return result.rows[0];
    },

    async getAllUsers() {
        const query = 'SELECT * FROM users ORDER BY registered_at DESC';
        const result = await pool.query(query);
        return result.rows;
    }
};

// Vote operations
const voteService = {
    async getVoteByCnp(cnp) {
        const query = 'SELECT * FROM votes WHERE cnp = $1';
        const result = await pool.query(query, [cnp]);
        return result.rows[0];
    },

    async createVote(voteData) {
        const { cnp, candidateId, candidateName, candidateParty } = voteData;
        const query = `
            INSERT INTO votes (cnp, candidate_id, candidate_name, candidate_party)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [cnp, candidateId, candidateName, candidateParty]);
        return result.rows[0];
    },

    async getAllVotes() {
        const query = 'SELECT * FROM votes ORDER BY voted_at DESC';
        const result = await pool.query(query);
        return result.rows;
    },

    async getVotingStats() {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.party,
                COUNT(v.id) as vote_count
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id, c.name, c.party
            ORDER BY c.id
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getVotingResults() {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.party,
                COUNT(v.id) as votes
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id, c.name, c.party
            ORDER BY votes DESC, c.name
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};

// Statistics operations
const statsService = {
    async getPartyStats() {
        const query = `
            SELECT 
                party,
                COUNT(*) as candidate_count
            FROM candidates
            GROUP BY party
            ORDER BY party
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getVotingStats() {
        const query = `
            SELECT 
                candidate_id,
                COUNT(*) as vote_count
            FROM votes
            GROUP BY candidate_id
        `;
        const result = await pool.query(query);
        
        // Convert to object format for easier frontend consumption
        const stats = {};
        result.rows.forEach(row => {
            stats[row.candidate_id] = parseInt(row.vote_count);
        });
        return stats;
    }
};

module.exports = {
    candidateService,
    userService,
    voteService,
    statsService
}; 