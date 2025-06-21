const pool = require('../config/database');

class ElectionSimulator {
    constructor() {
        this.voterCount = 100;
        this.topCandidatesForSecondRound = 2;
    }

    // Generate random voters for simulation
    generateRandomVoters() {
        const voters = [];
        for (let i = 1; i <= this.voterCount; i++) {
            const voter = {
                id: i,
                name: `Voter ${i}`,
                cnp: this.generateRandomCNP()
            };
            voters.push(voter);
        }
        return voters;
    }

    // Generate random 5-digit CNP
    generateRandomCNP() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    // Simulate first round voting
    async simulateFirstRound() {
        try {
            console.log('Starting first round simulation...');
            
            // Get all candidates
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            const candidates = candidatesResult.rows;
            
            if (candidates.length === 0) {
                throw new Error('No candidates found for election');
            }

            // Generate random voters
            const voters = this.generateRandomVoters();
            
            // Simulate voting for each voter
            const voteResults = {};
            candidates.forEach(candidate => {
                voteResults[candidate.id] = {
                    candidate_id: candidate.id,
                    candidate_name: candidate.name,
                    candidate_party: candidate.party,
                    votes: 0
                };
            });

            // Simulate random voting
            for (const voter of voters) {
                // Randomly select a candidate
                const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                voteResults[randomCandidate.id].votes++;
                
                // Record the vote in database
                await this.recordSimulatedVote(voter, randomCandidate);
            }

            // Convert to array and sort by votes
            const results = Object.values(voteResults).sort((a, b) => b.votes - a.votes);
            
            // Get top 2 candidates for second round
            const topCandidates = results.slice(0, this.topCandidatesForSecondRound);
            
            // Store first round results
            await this.storeFirstRoundResults(results, topCandidates);
            
            console.log('First round simulation completed!');
            console.log('Top 2 candidates for second round:');
            topCandidates.forEach((candidate, index) => {
                console.log(`${index + 1}. ${candidate.candidate_name} (${candidate.candidate_party}) - ${candidate.votes} votes`);
            });

            return {
                firstRoundResults: results,
                topCandidates: topCandidates,
                totalVoters: this.voterCount
            };

        } catch (error) {
            console.error('Error simulating first round:', error);
            throw error;
        }
    }

    // Simulate second round voting
    async simulateSecondRound() {
        try {
            console.log('Starting second round simulation...');
            
            // Get top 2 candidates from first round
            const topCandidatesResult = await pool.query(`
                SELECT candidate_id, candidate_name, candidate_party, votes 
                FROM first_round_results 
                ORDER BY votes DESC 
                LIMIT 2
            `);
            
            if (topCandidatesResult.rows.length < 2) {
                throw new Error('Not enough candidates for second round');
            }

            const topCandidates = topCandidatesResult.rows;
            
            // Generate new random voters for second round
            const voters = this.generateRandomVoters();
            
            // Simulate voting between top 2 candidates
            const voteResults = {};
            topCandidates.forEach(candidate => {
                voteResults[candidate.candidate_id] = {
                    candidate_id: candidate.candidate_id,
                    candidate_name: candidate.candidate_name,
                    candidate_party: candidate.candidate_party,
                    votes: 0
                };
            });

            // Simulate random voting for second round
            for (const voter of voters) {
                const randomCandidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
                voteResults[randomCandidate.candidate_id].votes++;
                
                // Record the vote in database
                await this.recordSimulatedVote(voter, randomCandidate, true);
            }

            // Convert to array and sort by votes
            const results = Object.values(voteResults).sort((a, b) => b.votes - a.votes);
            
            // Store second round results
            await this.storeSecondRoundResults(results);
            
            const winner = results[0];
            console.log('Second round simulation completed!');
            console.log(`Winner: ${winner.candidate_name} (${winner.candidate_party}) with ${winner.votes} votes`);

            return {
                secondRoundResults: results,
                winner: winner,
                totalVoters: this.voterCount
            };

        } catch (error) {
            console.error('Error simulating second round:', error);
            throw error;
        }
    }

    // Record a simulated vote
    async recordSimulatedVote(voter, candidate, isSecondRound = false) {
        try {
            // Create voter if doesn't exist
            await pool.query(`
                INSERT INTO users (name, cnp) 
                VALUES ($1, $2) 
                ON CONFLICT (cnp) DO NOTHING
            `, [voter.name, voter.cnp]);

            // Record the vote
            await pool.query(`
                INSERT INTO votes (cnp, candidate_id, candidate_name, candidate_party) 
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (cnp) DO NOTHING
            `, [voter.cnp, candidate.id, candidate.name, candidate.party]);

        } catch (error) {
            console.error('Error recording simulated vote:', error);
        }
    }

    // Store first round results
    async storeFirstRoundResults(results, topCandidates) {
        try {
            // Clear previous results
            await pool.query('DELETE FROM first_round_results');
            
            // Insert new results
            for (const result of results) {
                await pool.query(`
                    INSERT INTO first_round_results (candidate_id, candidate_name, candidate_party, votes, rank)
                    VALUES ($1, $2, $3, $4, $5)
                `, [result.candidate_id, result.candidate_name, result.candidate_party, result.votes, results.indexOf(result) + 1]);
            }

            // Store top candidates for second round
            await pool.query('DELETE FROM second_round_candidates');
            for (const candidate of topCandidates) {
                await pool.query(`
                    INSERT INTO second_round_candidates (candidate_id, candidate_name, candidate_party, first_round_votes)
                    VALUES ($1, $2, $3, $4)
                `, [candidate.candidate_id, candidate.candidate_name, candidate.candidate_party, candidate.votes]);
            }

        } catch (error) {
            console.error('Error storing first round results:', error);
            throw error;
        }
    }

    // Store second round results
    async storeSecondRoundResults(results) {
        try {
            // Clear previous results
            await pool.query('DELETE FROM second_round_results');
            
            // Insert new results
            for (const result of results) {
                await pool.query(`
                    INSERT INTO second_round_results (candidate_id, candidate_name, candidate_party, votes, rank)
                    VALUES ($1, $2, $3, $4, $5)
                `, [result.candidate_id, result.candidate_name, result.candidate_party, result.votes, results.indexOf(result) + 1]);
            }

        } catch (error) {
            console.error('Error storing second round results:', error);
            throw error;
        }
    }

    // Get election results
    async getElectionResults() {
        try {
            const [firstRound, secondRound, topCandidates] = await Promise.all([
                pool.query('SELECT * FROM first_round_results ORDER BY rank'),
                pool.query('SELECT * FROM second_round_results ORDER BY rank'),
                pool.query('SELECT * FROM second_round_candidates ORDER BY first_round_votes DESC')
            ]);

            return {
                firstRound: firstRound.rows,
                secondRound: secondRound.rows,
                topCandidates: topCandidates.rows
            };

        } catch (error) {
            console.error('Error getting election results:', error);
            throw error;
        }
    }

    // Reset election simulation
    async resetElection() {
        try {
            await Promise.all([
                pool.query('DELETE FROM first_round_results'),
                pool.query('DELETE FROM second_round_results'),
                pool.query('DELETE FROM second_round_candidates'),
                pool.query('DELETE FROM votes WHERE cnp LIKE \'Voter%\'')
            ]);
            
            console.log('Election simulation reset successfully');
        } catch (error) {
            console.error('Error resetting election:', error);
            throw error;
        }
    }
}

module.exports = new ElectionSimulator(); 