const pool = require('../config/database');

// Fake news sources
const newsSources = [
    'The Daily Chronicle',
    'Metro Times',
    'National Observer',
    'City Press',
    'The Evening Standard',
    'Morning Report',
    'Political Insider',
    'Community Voice',
    'State Gazette',
    'The Independent'
];

// News categories
const newsCategories = [
    'Campaign',
    'Policy',
    'Scandal',
    'Endorsement',
    'Fundraising',
    'Debate',
    'Poll Results',
    'Personal Life',
    'Controversy',
    'Achievement'
];

class FakeNewsGenerator {
    constructor() {
        this.newsTemplates = {
            positive: [
                "BREAKING: {candidate} reveals groundbreaking {policy} plan that experts say will revolutionize {topic}!",
                "EXCLUSIVE: {candidate} receives overwhelming support from {group} community for {initiative}",
                "INSPIRING: {candidate} delivers powerful speech on {topic} that brings audience to tears",
                "SUCCESS STORY: {candidate}'s innovative approach to {issue} shows remarkable results",
                "COMMUNITY HERO: {candidate} personally helps {number} families affected by {crisis}",
                "LEADERSHIP: {candidate} demonstrates exceptional {quality} in handling {situation}",
                "BREAKTHROUGH: {candidate} announces major breakthrough in {field} that will benefit millions",
                "ENDORSEMENT: Prominent {profession} endorses {candidate} for their {policy} stance"
            ],
            negative: [
                "SHOCKING: {candidate} caught in major {scandal} scandal that could end their campaign!",
                "EXPOSED: {candidate}'s controversial {statement} sparks outrage among {group}",
                "CONTROVERSY: {candidate} faces backlash for {action} that many call {negative_term}",
                "SCANDAL: {candidate} allegedly involved in {incident} that raises serious questions",
                "CRITICISM: {candidate} receives harsh criticism from {expert} over {policy}",
                "PROBLEM: {candidate}'s {plan} plan faces major obstacles and criticism",
                "DIVISIVE: {candidate} makes {statement} that divides {community}",
                "TROUBLE: {candidate} embroiled in {controversy} that threatens campaign"
            ],
            neutral: [
                "UPDATE: {candidate} announces new {policy} initiative for {topic}",
                "DEVELOPMENT: {candidate} meets with {group} to discuss {issue}",
                "ANNOUNCEMENT: {candidate} releases statement on {topic}",
                "MEETING: {candidate} attends {event} to address {concern}",
                "PLAN: {candidate} outlines approach to {challenge}",
                "DISCUSSION: {candidate} participates in debate about {issue}",
                "PROPOSAL: {candidate} suggests new framework for {policy}",
                "COLLABORATION: {candidate} works with {partner} on {project}"
            ]
        };

        this.sources = [
            'Daily Politics', 'National News Network', 'Political Insider', 'Capital Times',
            'Election Watch', 'Policy Review', 'Campaign Central', 'Voter Voice',
            'Democracy Now', 'Political Pulse', 'Election Daily', 'Campaign Watch'
        ];

        this.categories = [
            'Campaign News', 'Policy Announcements', 'Public Appearances', 'Endorsements',
            'Controversies', 'Community Events', 'Political Debates', 'Policy Proposals'
        ];

        this.replacements = {
            policy: ['healthcare reform', 'economic stimulus', 'education funding', 'environmental protection', 'tax reform', 'immigration policy', 'national security', 'social welfare'],
            topic: ['healthcare', 'economy', 'education', 'environment', 'taxes', 'immigration', 'security', 'social issues'],
            group: ['veterans', 'seniors', 'young voters', 'business owners', 'teachers', 'healthcare workers', 'farmers', 'students'],
            initiative: ['healthcare plan', 'economic package', 'education reform', 'environmental initiative', 'tax relief', 'immigration reform', 'security measures', 'social programs'],
            issue: ['healthcare access', 'economic inequality', 'education quality', 'climate change', 'tax burden', 'immigration system', 'national security', 'social justice'],
            quality: ['compassion', 'leadership', 'integrity', 'experience', 'vision', 'dedication', 'courage', 'wisdom'],
            situation: ['crisis', 'emergency', 'challenge', 'opportunity', 'transition', 'reform', 'development', 'initiative'],
            field: ['healthcare', 'economics', 'education', 'environmental science', 'public policy', 'social work', 'technology', 'infrastructure'],
            profession: ['economist', 'doctor', 'teacher', 'business leader', 'veteran', 'environmentalist', 'lawyer', 'scientist'],
            scandal: ['financial', 'ethical', 'personal', 'professional', 'political', 'administrative', 'legal', 'moral'],
            statement: ['controversial remarks', 'divisive comments', 'inappropriate language', 'misleading claims', 'offensive speech', 'false statements', 'inflammatory words', 'problematic views'],
            action: ['policy decision', 'public statement', 'campaign strategy', 'personal behavior', 'professional conduct', 'political move', 'administrative action', 'public appearance'],
            negative_term: ['unacceptable', 'inappropriate', 'concerning', 'problematic', 'divisive', 'controversial', 'troubling', 'alarming'],
            incident: ['financial misconduct', 'ethical violation', 'personal scandal', 'professional misconduct', 'political controversy', 'administrative failure', 'legal issue', 'moral lapse'],
            expert: ['political analyst', 'policy expert', 'academic researcher', 'industry leader', 'community leader', 'legal expert', 'economic analyst', 'social scientist'],
            plan: ['policy', 'proposal', 'initiative', 'program', 'strategy', 'approach', 'framework', 'agenda'],
            community: ['voters', 'citizens', 'residents', 'constituents', 'population', 'public', 'society', 'nation'],
            controversy: ['scandal', 'dispute', 'conflict', 'disagreement', 'debate', 'controversy', 'issue', 'problem'],
            event: ['town hall', 'rally', 'debate', 'meeting', 'conference', 'forum', 'summit', 'gathering'],
            concern: ['voter concerns', 'public issues', 'community needs', 'national challenges', 'policy matters', 'social problems', 'economic issues', 'environmental threats'],
            challenge: ['economic recovery', 'healthcare access', 'education reform', 'climate change', 'social inequality', 'national security', 'immigration reform', 'infrastructure development'],
            partner: ['local officials', 'community leaders', 'business partners', 'non-profit organizations', 'government agencies', 'educational institutions', 'healthcare providers', 'environmental groups'],
            project: ['community initiative', 'policy development', 'public service program', 'economic development', 'social reform', 'environmental protection', 'infrastructure improvement', 'educational enhancement'],
            number: ['hundreds of', 'thousands of', 'dozens of', 'scores of', 'numerous', 'many', 'several', 'multiple'],
            crisis: ['natural disaster', 'economic downturn', 'health emergency', 'social unrest', 'environmental crisis', 'security threat', 'infrastructure failure', 'community challenge']
        };
    }

    // Helper method to get random item from array
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Helper method to generate random number
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Helper method to replace placeholders in text
    replacePlaceholders(text, candidate) {
        let result = text;
        
        // Replace candidate name
        result = result.replace(/{candidate}/g, candidate.name);
        
        // Replace other placeholders
        for (const [key, values] of Object.entries(this.replacements)) {
            const placeholder = `{${key}}`;
            if (result.includes(placeholder)) {
                result = result.replace(placeholder, this.getRandomItem(values));
            }
        }
        
        return result;
    }

    // Generate fake news article
    generateNewsArticle(candidate) {
        const sentiment = this.getRandomItem(['positive', 'negative', 'neutral']);
        let template;
        
        switch (sentiment) {
            case 'positive':
                template = this.getRandomItem(this.newsTemplates.positive);
                break;
            case 'negative':
                template = this.getRandomItem(this.newsTemplates.negative);
                break;
            default:
                template = this.getRandomItem(this.newsTemplates.neutral);
        }

        return {
            candidate_id: candidate.id,
            title: this.replacePlaceholders(template, candidate),
            content: this.generateNewsContent(candidate, sentiment, 1),
            source: this.getRandomItem(this.sources),
            sentiment: sentiment,
            category: this.getRandomItem(this.categories)
        };
    }

    // Generate social media post
    generateSocialPost(candidate) {
        const platforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
        const platform = this.getRandomItem(platforms);
        
        let content = '';
        switch (platform) {
            case 'twitter':
                content = `Just wrapped up an amazing town hall in {location}! The energy and passion of our community is incredible. {hashtags} #Election2024 #ChangeWeNeed`;
                break;
            case 'facebook':
                content = `Today I had the privilege of meeting with {group} to discuss {issue}. Their insights and concerns will help shape my policy proposals. Together, we can build a better future for all of us. #CommunityFirst #RealSolutions`;
                break;
            case 'instagram':
                content = `Behind the scenes: preparing for tonight's debate. The issues we're discussing tonight affect every family in our community. Ready to share my vision for {topic}! 📸 #CampaignLife #DebateNight`;
                break;
            case 'linkedin':
                content = `Excited to share my comprehensive plan for {policy_area}. With {years} years of experience in {field}, I understand the challenges we face and have practical solutions to address them. Let's work together to create positive change. #Leadership #PolicyMatters`;
                break;
        }

        return {
            candidate_id: candidate.id,
            platform: platform,
            content: this.replacePlaceholders(content, candidate),
            likes: this.getRandomNumber(50, 5000),
            shares: this.getRandomNumber(10, 500),
            comments: this.getRandomNumber(5, 200)
        };
    }

    // Generate detailed news content
    generateNewsContent(candidate, sentiment, strength) {
        const paragraphs = [];
        
        if (sentiment === 'positive') {
            paragraphs.push(
                `${candidate.name} continues to impress voters with their ${this.getRandomItem(this.replacements.quality)} and dedication to ${this.getRandomItem(this.replacements.topic)}.`,
                `Recent polls show growing support for ${candidate.name}'s ${this.getRandomItem(this.replacements.policy)} plan, with ${this.getRandomItem(this.replacements.group)} expressing strong approval.`,
                `"${candidate.name} represents the kind of leadership we need right now," said a prominent ${this.getRandomItem(this.replacements.profession)} who recently endorsed the campaign.`
            );
        } else if (sentiment === 'negative') {
            paragraphs.push(
                `${candidate.name} faces mounting criticism over their ${this.getRandomItem(this.replacements.policy)} approach, with many calling it ${this.getRandomItem(this.replacements.negative_term)}.`,
                `Recent developments have raised serious questions about ${candidate.name}'s ${this.getRandomItem(this.replacements.quality)} and ability to handle ${this.getRandomItem(this.replacements.situation)}.`,
                `"This is exactly the kind of ${this.getRandomItem(this.replacements.negative_term)} behavior we can't afford in our leaders," commented a concerned ${this.getRandomItem(this.replacements.profession)}.`
            );
        } else {
            paragraphs.push(
                `${candidate.name} recently addressed ${this.getRandomItem(this.replacements.topic)} during a ${this.getRandomItem(this.replacements.event)} in the community.`,
                `The ${candidate.party} candidate outlined their approach to ${this.getRandomItem(this.replacements.challenge)}, emphasizing the need for ${this.getRandomItem(this.replacements.quality)}.`,
                `Community members had mixed reactions to ${candidate.name}'s proposals, with some expressing support while others remain skeptical.`
            );
        }

        return paragraphs.join(' ');
    }

    // Generate targeted news content based on sentiment and strength
    generateTargetedNewsContent(candidate, sentiment, strength) {
        const templates = this.newsTemplates[sentiment];
        const template = this.getRandomItem(templates);
        
        let title = template;
        let content = this.generateNewsContent(candidate, sentiment, strength);

        // Apply strength modifier to make news more impactful
        if (strength >= 8) {
            title = `🚨 ${title}`;
        } else if (strength >= 6) {
            title = `⚡ ${title}`;
        } else if (strength >= 4) {
            title = `📢 ${title}`;
        }

        // Replace placeholders
        title = this.replacePlaceholders(title, candidate);
        content = this.replacePlaceholders(content, candidate);

        return {
            title: title,
            content: content,
            source: this.getRandomItem(this.sources),
            sentiment: sentiment,
            category: this.getRandomItem(this.categories)
        };
    }

    // Database service functions
    async generateNewsForCandidate(candidateId) {
        try {
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            
            const candidate = candidateResult.rows[0];
            const newsArticle = this.generateNewsArticle(candidate);
            
            const result = await pool.query(`
                INSERT INTO news (candidate_id, title, content, source, sentiment, category)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [newsArticle.candidate_id, newsArticle.title, newsArticle.content, newsArticle.source, newsArticle.sentiment, newsArticle.category]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error generating news:', error);
            throw error;
        }
    }

    async generateSocialPostForCandidate(candidateId) {
        try {
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            
            const candidate = candidateResult.rows[0];
            const socialPost = this.generateSocialPost(candidate);
            
            const result = await pool.query(`
                INSERT INTO social_posts (candidate_id, platform, content, likes, shares, comments)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [socialPost.candidate_id, socialPost.platform, socialPost.content, socialPost.likes, socialPost.shares, socialPost.comments]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error generating social post:', error);
            throw error;
        }
    }

    async getNewsForCandidate(candidateId, limit = 10) {
        try {
            const result = await pool.query(`
                SELECT * FROM news 
                WHERE candidate_id = $1 
                ORDER BY published_at DESC 
                LIMIT $2
            `, [candidateId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting news:', error);
            throw error;
        }
    }

    async getSocialPostsForCandidate(candidateId, limit = 10) {
        try {
            const result = await pool.query(`
                SELECT * FROM social_posts 
                WHERE candidate_id = $1 
                ORDER BY posted_at DESC 
                LIMIT $2
            `, [candidateId, limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting social posts:', error);
            throw error;
        }
    }

    async getAllNews(limit = 50) {
        try {
            const result = await pool.query(`
                SELECT n.*, c.name as candidate_name, c.party as candidate_party
                FROM news n
                JOIN candidates c ON n.candidate_id = c.id
                ORDER BY n.published_at DESC 
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            console.error('Error getting all news:', error);
            throw error;
        }
    }

    async populateInitialNews() {
        try {
            const candidates = await pool.query('SELECT * FROM candidates');
            
            for (const candidate of candidates.rows) {
                // Generate 3-5 news articles per candidate
                const newsCount = this.getRandomNumber(3, 5);
                for (let i = 0; i < newsCount; i++) {
                    await this.generateNewsForCandidate(candidate.id);
                }
                
                // Generate 2-4 social media posts per candidate
                const socialCount = this.getRandomNumber(2, 4);
                for (let i = 0; i < socialCount; i++) {
                    await this.generateSocialPostForCandidate(candidate.id);
                }
            }
            
            console.log('Initial news and social media content generated successfully');
        } catch (error) {
            console.error('Error populating initial news:', error);
            throw error;
        }
    }

    // Generate user-targeted news based on user preferences
    async generateUserTargetedNews(userCnp, candidateId, sentiment = null) {
        try {
            // Get user preferences for this candidate
            const preferenceResult = await pool.query(`
                SELECT preference_type, strength 
                FROM user_candidate_preferences 
                WHERE user_cnp = $1 AND candidate_id = $2
            `, [userCnp, candidateId]);

            let targetSentiment = sentiment;
            let strength = 1;

            if (preferenceResult.rows.length > 0) {
                const preference = preferenceResult.rows[0];
                targetSentiment = preference.preference_type;
                strength = preference.strength;
            } else {
                // If no preference exists, randomly assign one
                targetSentiment = targetSentiment || this.getRandomItem(['positive', 'negative', 'neutral']);
                strength = this.getRandomNumber(1, 5);
            }

            // Get candidate info
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            const candidate = candidateResult.rows[0];

            // Generate news based on sentiment and strength
            const news = this.generateTargetedNewsContent(candidate, targetSentiment, strength);

            // Store the targeted news
            const insertResult = await pool.query(`
                INSERT INTO user_targeted_news (user_cnp, candidate_id, title, content, source, sentiment, category)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [userCnp, candidateId, news.title, news.content, news.source, news.sentiment, news.category]);

            return insertResult.rows[0];

        } catch (error) {
            console.error('Error generating user-targeted news:', error);
            throw error;
        }
    }

    // Get user-targeted news for a specific user
    async getUserTargetedNews(userCnp, limit = 10) {
        try {
            const result = await pool.query(`
                SELECT utn.*, c.name as candidate_name, c.party as candidate_party
                FROM user_targeted_news utn
                JOIN candidates c ON utn.candidate_id = c.id
                WHERE utn.user_cnp = $1
                ORDER BY utn.published_at DESC
                LIMIT $2
            `, [userCnp, limit]);
            
            return result.rows;
        } catch (error) {
            console.error('Error getting user-targeted news:', error);
            throw error;
        }
    }

    // Get user-targeted news for a specific candidate
    async getUserTargetedNewsForCandidate(userCnp, candidateId, limit = 5) {
        try {
            const result = await pool.query(`
                SELECT utn.*, c.name as candidate_name, c.party as candidate_party
                FROM user_targeted_news utn
                JOIN candidates c ON utn.candidate_id = c.id
                WHERE utn.user_cnp = $1 AND utn.candidate_id = $2
                ORDER BY utn.published_at DESC
                LIMIT $3
            `, [userCnp, candidateId, limit]);
            
            return result.rows;
        } catch (error) {
            console.error('Error getting user-targeted news for candidate:', error);
            throw error;
        }
    }

    // Update or create user preferences for a candidate
    async updateUserPreference(userCnp, candidateId, preferenceType, strength = 1) {
        try {
            const result = await pool.query(`
                INSERT INTO user_candidate_preferences (user_cnp, candidate_id, preference_type, strength)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_cnp, candidate_id) 
                DO UPDATE SET 
                    preference_type = $3,
                    strength = $4,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [userCnp, candidateId, preferenceType, strength]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user preference:', error);
            throw error;
        }
    }

    // Get user preferences for all candidates
    async getUserPreferences(userCnp) {
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
            console.error('Error getting user preferences:', error);
            throw error;
        }
    }

    // Mark news as read
    async markNewsAsRead(newsId, userCnp) {
        try {
            const result = await pool.query(`
                UPDATE user_targeted_news 
                SET is_read = TRUE 
                WHERE id = $1 AND user_cnp = $2
                RETURNING *
            `, [newsId, userCnp]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error marking news as read:', error);
            throw error;
        }
    }

    // Generate initial user preferences based on voting history
    async generateInitialUserPreferences(userCnp) {
        try {
            // Get user's voting history
            const voteResult = await pool.query(`
                SELECT candidate_id, candidate_name, candidate_party
                FROM votes 
                WHERE cnp = $1
                ORDER BY voted_at DESC
                LIMIT 1
            `, [userCnp]);

            if (voteResult.rows.length === 0) {
                // No voting history, generate random preferences
                await this.generateRandomPreferences(userCnp);
                return;
            }

            const userVote = voteResult.rows[0];
            
            // Get all candidates
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            const candidates = candidatesResult.rows;

            for (const candidate of candidates) {
                let preferenceType = 'neutral';
                let strength = 1;

                if (candidate.id === userVote.candidate_id) {
                    // User voted for this candidate - positive preference
                    preferenceType = 'positive';
                    strength = this.getRandomNumber(7, 9);
                } else if (candidate.party === userVote.candidate_party) {
                    // Same party - mostly positive but some neutral
                    if (this.getRandomNumber(1, 3) <= 2) {
                        preferenceType = 'positive';
                        strength = this.getRandomNumber(4, 6);
                    } else {
                        preferenceType = 'neutral';
                        strength = this.getRandomNumber(3, 5);
                    }
                } else {
                    // Different party - mix of negative and neutral for realism
                    if (this.getRandomNumber(1, 3) <= 2) {
                        preferenceType = 'negative';
                        strength = this.getRandomNumber(4, 6);
                    } else {
                        preferenceType = 'neutral';
                        strength = this.getRandomNumber(3, 5);
                    }
                }

                await this.updateUserPreference(userCnp, candidate.id, preferenceType, strength);
            }

            console.log(`Generated initial preferences for user ${userCnp}`);
        } catch (error) {
            console.error('Error generating initial user preferences:', error);
            throw error;
        }
    }

    // Generate random preferences for users without voting history
    async generateRandomPreferences(userCnp) {
        try {
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            const candidates = candidatesResult.rows;

            for (const candidate of candidates) {
                // Create more balanced preferences: 40% neutral, 30% positive, 30% negative
                const rand = this.getRandomNumber(1, 10);
                let preferenceType;
                
                if (rand <= 4) {
                    preferenceType = 'neutral';
                } else if (rand <= 7) {
                    preferenceType = 'positive';
                } else {
                    preferenceType = 'negative';
                }
                
                const strength = this.getRandomNumber(1, 5);
                
                await this.updateUserPreference(userCnp, candidate.id, preferenceType, strength);
            }

            console.log(`Generated random preferences for user ${userCnp}`);
        } catch (error) {
            console.error('Error generating random preferences:', error);
            throw error;
        }
    }

    // Generate targeted news for all users
    async generateTargetedNewsForAllUsers() {
        try {
            const usersResult = await pool.query('SELECT cnp FROM users');
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            
            for (const user of usersResult.rows) {
                // First, generate user preferences if they don't exist
                try {
                    await this.generateInitialUserPreferences(user.cnp);
                } catch (error) {
                    console.log(`User preferences already exist for ${user.cnp}: ${error.message}`);
                }
                
                for (const candidate of candidatesResult.rows) {
                    // Generate 1-3 news articles per candidate per user with varied sentiments
                    const articleCount = this.getRandomNumber(1, 3);
                    
                    for (let i = 0; i < articleCount; i++) {
                        // For variety, sometimes override the user's preference with a different sentiment
                        let sentiment = null;
                        if (i > 0 && this.getRandomNumber(1, 3) === 1) {
                            // 1/3 chance to use a different sentiment for variety
                            const sentiments = ['positive', 'negative', 'neutral'];
                            sentiment = this.getRandomItem(sentiments);
                        }
                        
                        await this.generateUserTargetedNews(user.cnp, candidate.id, sentiment);
                    }
                }
            }
            
            console.log('Generated targeted news for all users');
        } catch (error) {
            console.error('Error generating targeted news for all users:', error);
            throw error;
        }
    }
}

module.exports = new FakeNewsGenerator(); 