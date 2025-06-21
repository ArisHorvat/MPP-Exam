const pool = require('../config/database');

class ElectionSimulator {
    constructor() {
        this.automaticVoterCount = 90;
        this.topCandidatesForSecondRound = 2;
        this.usedCNPs = new Set(); // Track used CNPs to prevent duplicates
        this.currentElectionId = null; // Track current election session
    }

    // Generate a unique election ID
    generateElectionId() {
        return `election_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Start a new election session
    async startNewElection() {
        this.currentElectionId = this.generateElectionId();
        this.usedCNPs.clear();
        console.log(`Starting new election session: ${this.currentElectionId}`);
    }

    // Generate random voters for simulation
    generateRandomVoters() {
        const voters = [];
        this.usedCNPs.clear(); // Clear used CNPs for new election
        
        for (let i = 1; i <= this.automaticVoterCount; i++) {
            const voter = {
                id: i,
                name: `Auto Voter ${i}`,
                cnp: this.generateRandomCNP()
            };
            voters.push(voter);
        }
        return voters;
    }

    // Generate unique random 5-digit CNP
    generateRandomCNP() {
        let cnp;
        let attempts = 0;
        const maxAttempts = 1000;
        
        do {
            cnp = Math.floor(10000 + Math.random() * 90000).toString();
            attempts++;
            
            if (attempts > maxAttempts) {
                throw new Error('Unable to generate unique CNP after maximum attempts');
            }
        } while (this.usedCNPs.has(cnp));
        
        this.usedCNPs.add(cnp);
        return cnp;
    }

    // Simulate automatic first round voting (100 voters)
    async simulateAutomaticFirstRound() {
        try {
            console.log('Starting automatic first round simulation...');
            
            // Clear all previous votes to start fresh
            await pool.query('DELETE FROM votes');
            console.log('Cleared all previous votes');
            
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

            // Simulate preference-based voting
            for (const voter of voters) {
                // Create user preferences for this voter
                await this.createVoterPreferences(voter, candidates);
                
                // Get the voter's preferences
                const preferences = await this.getVoterPreferences(voter.cnp);
                
                // Find the candidate with the highest positive preference
                let bestCandidate = null;
                let bestScore = -1;
                let decisionReason = '';
                
                for (const preference of preferences) {
                    if (preference.preference_type === 'positive' && preference.strength > bestScore) {
                        bestScore = preference.strength;
                        bestCandidate = candidates.find(c => c.id === preference.candidate_id);
                        decisionReason = `positive preference (strength: ${preference.strength})`;
                    }
                }
                
                // If no positive preference found, find the least negative preference
                if (!bestCandidate) {
                    let leastNegativeScore = -10;
                    for (const preference of preferences) {
                        if (preference.preference_type === 'negative' && preference.strength > leastNegativeScore) {
                            leastNegativeScore = preference.strength;
                            bestCandidate = candidates.find(c => c.id === preference.candidate_id);
                            decisionReason = `least negative preference (strength: ${preference.strength})`;
                        }
                    }
                }
                
                // If still no candidate found, pick a random one (fallback)
                if (!bestCandidate) {
                    bestCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                    decisionReason = 'random fallback (no clear preference)';
                }
                
                console.log(`Voter ${voter.cnp} voted for ${bestCandidate.name} (${bestCandidate.party}) - ${decisionReason}`);
                
                voteResults[bestCandidate.id].votes++;
                
                // Record the vote in database
                await this.recordSimulatedVote(voter, bestCandidate);
            }

            // Verify vote count
            const totalVotes = await this.verifyVoteCount();
            if (totalVotes !== this.automaticVoterCount) {
                console.warn(`Warning: Expected ${this.automaticVoterCount} votes, but found ${totalVotes}`);
            }

            // Convert to array and sort by votes
            const results = Object.values(voteResults).sort((a, b) => b.votes - a.votes);
            
            // Get top 2 candidates for second round
            const topCandidates = results.slice(0, this.topCandidatesForSecondRound);
            
            // Store first round results
            await this.storeFirstRoundResults(results, topCandidates);
            
            console.log('Automatic first round simulation completed!');
            console.log('Top 2 candidates for second round:');
            topCandidates.forEach((candidate, index) => {
                console.log(`${index + 1}. ${candidate.candidate_name} (${candidate.candidate_party}) - ${candidate.votes} votes`);
            });

            return {
                firstRoundResults: results,
                topCandidates: topCandidates,
                totalAutomaticVoters: this.automaticVoterCount,
                waitingForUserVote: true
            };

        } catch (error) {
            console.error('Error simulating automatic first round:', error);
            throw error;
        }
    }

    // Handle user vote for first round (101st vote)
    async handleUserFirstRoundVote(userCnp, candidateId) {
        try {
            console.log(`Processing user vote: CNP=${userCnp}, CandidateID=${candidateId}`);
            
            // Get candidate info
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            const candidate = candidateResult.rows[0];
            console.log(`Found candidate: ${candidate.name} (${candidate.party})`);

            // Record user vote
            await this.recordUserVote(userCnp, candidate, false);
            console.log(`User vote recorded successfully`);

            // Get updated first round results
            const updatedResults = await this.getUpdatedFirstRoundResults();
            console.log(`Updated results: ${updatedResults.length} candidates`);
            
            // Get top 2 candidates for second round
            const topCandidates = updatedResults.slice(0, 2);
            console.log(`Top candidates for second round: ${topCandidates.map(c => c.candidate_name).join(', ')}`);
            
            // Store results
            await this.storeFirstRoundResults(updatedResults, topCandidates);
            console.log(`First round results stored successfully`);

            // Verify final vote count
            const totalVotes = await this.verifyVoteCount();
            if (totalVotes !== this.automaticVoterCount + 1) {
                console.warn(`Warning: Expected ${this.automaticVoterCount + 1} votes after user vote, but found ${totalVotes}`);
            }

            return {
                firstRoundResults: updatedResults,
                topCandidates: topCandidates,
                totalVoters: this.automaticVoterCount + 1,
                userVote: {
                    candidate_id: candidate.id,
                    candidate_name: candidate.name,
                    candidate_party: candidate.party
                }
            };

        } catch (error) {
            console.error('Error handling user first round vote:', error);
            throw error;
        }
    }

    // Simulate automatic second round voting (100 voters)
    async simulateAutomaticSecondRound() {
        try {
            console.log('Starting automatic second round simulation...');
            
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

            // Simulate preference-based voting for second round
            for (const voter of voters) {
                // Create user preferences for this voter (if they don't exist)
                await this.createVoterPreferences(voter, topCandidates);
                
                // Get the voter's preferences for the top 2 candidates
                const preferences = await this.getVoterPreferences(voter.cnp);
                const topCandidatePreferences = preferences.filter(p => 
                    topCandidates.some(tc => tc.candidate_id === p.candidate_id)
                );
                
                // Find the candidate with the highest positive preference
                let bestCandidate = null;
                let bestScore = -1;
                let decisionReason = '';
                
                for (const preference of topCandidatePreferences) {
                    if (preference.preference_type === 'positive' && preference.strength > bestScore) {
                        bestScore = preference.strength;
                        bestCandidate = topCandidates.find(c => c.candidate_id === preference.candidate_id);
                        decisionReason = `positive preference (strength: ${preference.strength})`;
                    }
                }
                
                // If no positive preference found, find the least negative preference
                if (!bestCandidate) {
                    let leastNegativeScore = -10;
                    for (const preference of topCandidatePreferences) {
                        if (preference.preference_type === 'negative' && preference.strength > leastNegativeScore) {
                            leastNegativeScore = preference.strength;
                            bestCandidate = topCandidates.find(c => c.candidate_id === preference.candidate_id);
                            decisionReason = `least negative preference (strength: ${preference.strength})`;
                        }
                    }
                }
                
                // If still no candidate found, pick a random one (fallback)
                if (!bestCandidate) {
                    bestCandidate = topCandidates[Math.floor(Math.random() * topCandidates.length)];
                    decisionReason = 'random fallback (no clear preference)';
                }
                
                console.log(`Voter ${voter.cnp} voted for ${bestCandidate.candidate_name} (${bestCandidate.candidate_party}) - ${decisionReason}`);
                
                voteResults[bestCandidate.candidate_id].votes++;
                
                // Record the vote in database
                await this.recordSimulatedVote(voter, bestCandidate, true);
            }

            // Convert to array and sort by votes
            const results = Object.values(voteResults).sort((a, b) => b.votes - a.votes);
            
            // Store second round results
            await this.storeSecondRoundResults(results);
            
            console.log('Automatic second round simulation completed!');
            console.log('Waiting for user vote to determine final winner...');

            return {
                secondRoundResults: results,
                totalAutomaticVoters: this.automaticVoterCount,
                waitingForUserVote: true
            };

        } catch (error) {
            console.error('Error simulating automatic second round:', error);
            throw error;
        }
    }

    // Handle user vote for second round (101st vote)
    async handleUserSecondRoundVote(userCnp, candidateId) {
        try {
            console.log(`Processing user second round vote: CNP=${userCnp}, CandidateID=${candidateId}`);
            
            // Get candidate info
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            const candidate = candidateResult.rows[0];
            console.log(`Found candidate: ${candidate.name} (${candidate.party})`);

            // Record user vote
            await this.recordUserVote(userCnp, candidate, true);
            console.log(`User second round vote recorded successfully`);

            // Get updated second round results
            const updatedResults = await this.getUpdatedSecondRoundResults();
            console.log(`Updated second round results: ${updatedResults.length} candidates`);
            
            // Update stored results
            await this.storeSecondRoundResults(updatedResults);
            console.log(`Second round results stored successfully`);

            const winner = updatedResults[0];
            console.log('Second round completed with user vote!');
            console.log(`Winner: ${winner.candidate_name} (${winner.candidate_party}) with ${winner.votes} votes`);

            return {
                secondRoundResults: updatedResults,
                winner: winner,
                totalVoters: this.automaticVoterCount + 1,
                userVote: {
                    candidate_id: candidate.id,
                    candidate_name: candidate.name,
                    candidate_party: candidate.party
                }
            };

        } catch (error) {
            console.error('Error handling user second round vote:', error);
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

            // Check if this voter has already voted
            const existingVote = await pool.query('SELECT * FROM votes WHERE cnp = $1', [voter.cnp]);
            
            if (existingVote.rows.length > 0) {
                // Voter has already voted, update their vote for the new round
                await pool.query(`
                    UPDATE votes 
                    SET candidate_id = $1, candidate_name = $2, candidate_party = $3, voted_at = CURRENT_TIMESTAMP
                    WHERE cnp = $4
                `, [candidate.id, candidate.name, candidate.party, voter.cnp]);
            } else {
                // Voter hasn't voted yet, insert new vote
                await pool.query(`
                    INSERT INTO votes (cnp, candidate_id, candidate_name, candidate_party) 
                    VALUES ($1, $2, $3, $4)
                `, [voter.cnp, candidate.id, candidate.name, candidate.party]);
            }

        } catch (error) {
            console.error('Error recording simulated vote:', error);
        }
    }

    // Record a user vote
    async recordUserVote(userCnp, candidate, isSecondRound = false) {
        try {
            console.log(`Recording user vote: CNP=${userCnp}, Candidate=${candidate.name}, SecondRound=${isSecondRound}`);
            
            // Check if user has already voted
            const existingVote = await pool.query('SELECT * FROM votes WHERE cnp = $1', [userCnp]);
            
            if (existingVote.rows.length > 0) {
                console.log(`User has already voted, updating vote for ${isSecondRound ? 'second' : 'first'} round`);
                // User has already voted, update their vote for the new round
                await pool.query(`
                    UPDATE votes 
                    SET candidate_id = $1, candidate_name = $2, candidate_party = $3, voted_at = CURRENT_TIMESTAMP
                    WHERE cnp = $4
                `, [candidate.id, candidate.name, candidate.party, userCnp]);
            } else {
                console.log(`User hasn't voted yet, inserting new vote`);
                // User hasn't voted yet, insert new vote
                await pool.query(`
                    INSERT INTO votes (cnp, candidate_id, candidate_name, candidate_party) 
                    VALUES ($1, $2, $3, $4)
                `, [userCnp, candidate.id, candidate.name, candidate.party]);
            }
            
            console.log(`Vote recorded successfully`);

        } catch (error) {
            console.error('Error recording user vote:', error);
            throw error;
        }
    }

    // Get updated first round results after user vote
    async getUpdatedFirstRoundResults() {
        const result = await pool.query(`
            SELECT 
                c.id as candidate_id,
                c.name as candidate_name,
                c.party as candidate_party,
                COUNT(v.id) as votes
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id, c.name, c.party
            ORDER BY votes DESC
        `);
        
        // Debug: Log vote counts
        console.log('First round vote counts:');
        result.rows.forEach(row => {
            console.log(`  ${row.candidate_name}: ${row.votes} votes`);
        });
        
        return result.rows;
    }

    // Get updated second round results after user vote
    async getUpdatedSecondRoundResults() {
        const result = await pool.query(`
            SELECT 
                c.id as candidate_id,
                c.name as candidate_name,
                c.party as candidate_party,
                COUNT(v.id) as votes
            FROM candidates c
            INNER JOIN second_round_candidates src ON c.id = src.candidate_id
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id, c.name, c.party
            ORDER BY votes DESC
        `);
        
        // Debug: Log vote counts
        console.log('Second round vote counts:');
        result.rows.forEach(row => {
            console.log(`  ${row.candidate_name}: ${row.votes} votes`);
        });
        
        return result.rows;
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
            console.log('Resetting election simulation...');
            
            // Clear all votes
            await pool.query('DELETE FROM votes');
            console.log('Cleared all votes');
            
            // Clear first round results
            await pool.query('DELETE FROM first_round_results');
            console.log('Cleared first round results');
            
            // Clear second round results
            await pool.query('DELETE FROM second_round_results');
            console.log('Cleared second round results');
            
            // Clear user preferences for automatic voters (keep real users)
            await pool.query(`
                DELETE FROM user_candidate_preferences 
                WHERE user_cnp IN (
                    SELECT cnp FROM users 
                    WHERE name LIKE 'Auto Voter %'
                )
            `);
            console.log('Cleared automatic voter preferences');
            
            // Clear automatic voters (keep real users)
            await pool.query(`
                DELETE FROM users 
                WHERE name LIKE 'Auto Voter %'
            `);
            console.log('Cleared automatic voters');
            
            // Reset election state
            this.usedCNPs.clear();
            this.currentElectionId = null;
            
            console.log('Election simulation reset successfully');
            
        } catch (error) {
            console.error('Error resetting election:', error);
            throw error;
        }
    }

    // Verify total vote count
    async verifyVoteCount() {
        const result = await pool.query('SELECT COUNT(*) as total_votes FROM votes');
        const totalVotes = parseInt(result.rows[0].total_votes);
        console.log(`Total votes in database: ${totalVotes}`);
        return totalVotes;
    }

    // Create preferences for an automatic voter
    async createVoterPreferences(voter, candidates) {
        try {
            // Create user record for this voter if it doesn't exist
            await pool.query(`
                INSERT INTO users (name, cnp) 
                VALUES ($1, $2) 
                ON CONFLICT (cnp) DO NOTHING
            `, [voter.name, voter.cnp]);

            // Generate preferences for each candidate
            for (const candidate of candidates) {
                // Create more realistic preferences: 40% neutral, 30% positive, 30% negative
                const rand = Math.floor(Math.random() * 10) + 1;
                let preferenceType;
                
                if (rand <= 4) {
                    preferenceType = 'neutral';
                } else if (rand <= 7) {
                    preferenceType = 'positive';
                } else {
                    preferenceType = 'negative';
                }
                
                const strength = Math.floor(Math.random() * 5) + 1;
                
                // Insert preference
                await pool.query(`
                    INSERT INTO user_candidate_preferences (user_cnp, candidate_id, preference_type, strength)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (user_cnp, candidate_id) 
                    DO UPDATE SET 
                        preference_type = $3,
                        strength = $4,
                        updated_at = CURRENT_TIMESTAMP
                `, [voter.cnp, candidate.id, preferenceType, strength]);
            }
            
            console.log(`Created preferences for voter ${voter.cnp}`);
        } catch (error) {
            console.error('Error creating voter preferences:', error);
            throw error;
        }
    }

    // Get preferences for a voter
    async getVoterPreferences(userCnp) {
        try {
            const result = await pool.query(`
                SELECT ucp.*, c.name as candidate_name, c.party as candidate_party
                FROM user_candidate_preferences ucp
                JOIN candidates c ON ucp.candidate_id = c.id
                WHERE ucp.user_cnp = $1
                ORDER BY ucp.updated_at DESC
            `, [userCnp]);
            
            return result.rows;
        } catch (error) {
            console.error('Error getting voter preferences:', error);
            throw error;
        }
    }
}

module.exports = new ElectionSimulator(); 