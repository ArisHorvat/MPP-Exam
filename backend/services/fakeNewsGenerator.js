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

// Positive news templates
const positiveNewsTemplates = [
    {
        title: "{candidate} Receives Major Endorsement from {organization}",
        content: "In a significant boost to their campaign, {candidate} has received a major endorsement from {organization}. The endorsement comes as {candidate} continues to gain momentum in the polls, with recent surveys showing growing support among {demographic}. 'This endorsement represents the trust and confidence that {organization} has in our vision for the future,' said {candidate} during a press conference. Political analysts suggest this could be a game-changer in the race."
    },
    {
        title: "{candidate} Proposes Revolutionary {policy} Plan",
        content: "Breaking new ground in political discourse, {candidate} has unveiled a comprehensive {policy} plan that experts are calling 'revolutionary' and 'forward-thinking.' The plan, which includes {details}, has already garnered support from {experts}. 'This is exactly the kind of innovative thinking our community needs,' said {supporter}. The proposal has sparked widespread discussion across social media platforms."
    },
    {
        title: "Poll Shows {candidate} Leading in {region}",
        content: "Latest polling data reveals that {candidate} has taken a commanding lead in {region}, with support from {percentage}% of likely voters. The surge in popularity comes after {candidate}'s recent {event}, which resonated strongly with voters. 'The numbers speak for themselves,' said campaign manager {manager}. 'People are responding to {candidate}'s message of {message}.'"
    },
    {
        title: "{candidate} Raises Record-Breaking {amount} in Campaign Funds",
        content: "In an impressive display of grassroots support, {candidate} has raised {amount} in campaign funds, setting a new record for {election_type}. The funds, primarily from small donors, demonstrate widespread community support. 'This isn't about big money interests,' said {candidate}. 'This is about people power and the belief that we can create positive change together.'"
    }
];

// Negative news templates
const negativeNewsTemplates = [
    {
        title: "Controversy Surrounds {candidate}'s {issue}",
        content: "Questions are being raised about {candidate}'s position on {issue}, with critics pointing to {specific_concern}. The controversy has sparked heated debate on social media, with supporters defending {candidate}'s record while opponents call for clarification. 'This is a serious matter that deserves attention,' said {critic}. {candidate} has yet to respond to the allegations."
    },
    {
        title: "{candidate} Faces Backlash Over {statement}",
        content: "A recent statement by {candidate} regarding {topic} has drawn sharp criticism from {groups}. The comments, made during {event}, have been described as 'insensitive' and 'out of touch' by political opponents. Social media has been flooded with reactions, with many calling for {candidate} to apologize. The campaign has issued a statement defending the remarks."
    },
    {
        title: "Poll Numbers Drop for {candidate} After {incident}",
        content: "Recent polling shows a significant drop in support for {candidate} following {incident}. The {percentage}% decline has political analysts questioning the campaign's strategy. 'This is a wake-up call,' said {analyst}. 'Voters are clearly concerned about {issue}.' The campaign has vowed to address the concerns and regain momentum."
    }
];

// Neutral news templates
const neutralNewsTemplates = [
    {
        title: "{candidate} Announces Campaign Schedule for {period}",
        content: "The {candidate} campaign has released its official schedule for {period}, including stops in {locations}. The tour will focus on {topics} and include several public appearances. Campaign officials say the schedule reflects {candidate}'s commitment to meeting voters face-to-face and discussing the issues that matter most to them."
    },
    {
        title: "{candidate} Participates in {event}",
        content: "Yesterday, {candidate} participated in {event}, where they {actions}. The event, attended by {attendees}, provided an opportunity for {candidate} to connect with voters and discuss their platform. 'It's important to be present in our communities,' said {candidate}. 'These events help me understand the real concerns of the people I hope to represent.'"
    },
    {
        title: "New Campaign Ad Released by {candidate}",
        content: "The {candidate} campaign has released a new television advertisement titled '{ad_title}.' The {duration}-second spot focuses on {theme} and features {features}. The ad will air on {networks} throughout {region}. Campaign officials say the advertisement effectively communicates {candidate}'s vision for the future."
    }
];

// Social media content templates
const socialMediaTemplates = [
    {
        platform: 'twitter',
        content: "Just wrapped up an amazing town hall in {location}! The energy and passion of our community is incredible. {hashtags} #Election2024 #ChangeWeNeed"
    },
    {
        platform: 'facebook',
        content: "Today I had the privilege of meeting with {group} to discuss {issue}. Their insights and concerns will help shape my policy proposals. Together, we can build a better future for all of us. #CommunityFirst #RealSolutions"
    },
    {
        platform: 'instagram',
        content: "Behind the scenes: preparing for tonight's debate. The issues we're discussing tonight affect every family in our community. Ready to share my vision for {topic}! 📸 #CampaignLife #DebateNight"
    },
    {
        platform: 'linkedin',
        content: "Excited to share my comprehensive plan for {policy_area}. With {years} years of experience in {field}, I understand the challenges we face and have practical solutions to address them. Let's work together to create positive change. #Leadership #PolicyMatters"
    }
];

// Helper function to get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate random number
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to replace placeholders in templates
function replacePlaceholders(template, candidate) {
    const replacements = {
        '{candidate}': candidate.name,
        '{organization}': getRandomItem(['Local Business Association', 'Teachers Union', 'Environmental Coalition', 'Veterans Group', 'Healthcare Workers Union']),
        '{demographic}': getRandomItem(['young voters', 'seniors', 'working families', 'small business owners', 'students']),
        '{policy}': getRandomItem(['Healthcare Reform', 'Education Funding', 'Economic Development', 'Environmental Protection', 'Public Safety']),
        '{details}': getRandomItem(['increased funding for public schools', 'tax incentives for small businesses', 'renewable energy initiatives', 'affordable housing programs']),
        '{experts}': getRandomItem(['leading economists', 'policy experts', 'community leaders', 'business owners']),
        '{supporter}': getRandomItem(['local resident Maria Johnson', 'business owner Tom Smith', 'community activist Sarah Wilson']),
        '{region}': getRandomItem(['downtown district', 'suburban areas', 'rural communities', 'coastal regions']),
        '{percentage}': getRandomNumber(45, 65),
        '{event}': getRandomItem(['town hall meeting', 'policy announcement', 'community service event', 'debate performance']),
        '{message}': getRandomItem(['hope and change', 'unity and progress', 'community values', 'economic opportunity']),
        '{amount}': getRandomItem(['$250,000', '$500,000', '$750,000', '$1 million']),
        '{election_type}': getRandomItem(['local elections', 'state primaries', 'general elections']),
        '{issue}': getRandomItem(['tax policy', 'environmental regulations', 'education funding', 'healthcare access']),
        '{specific_concern}': getRandomItem(['previous voting record', 'campaign contributions', 'personal finances', 'policy inconsistencies']),
        '{critic}': getRandomItem(['political analyst Dr. Johnson', 'opponent campaign manager', 'local activist group']),
        '{topic}': getRandomItem(['immigration policy', 'economic development', 'social programs', 'foreign relations']),
        '{groups}': getRandomItem(['advocacy groups', 'community organizations', 'political opponents']),
        '{incident}': getRandomItem(['controversial statement', 'policy flip-flop', 'campaign finance issue']),
        '{statement}': getRandomItem(['controversial remarks', 'policy position', 'campaign promise', 'public comment', 'interview response']),
        '{analyst}': getRandomItem(['political strategist', 'polling expert', 'campaign consultant']),
        '{period}': getRandomItem(['next week', 'the coming month', 'the final stretch']),
        '{locations}': getRandomItem(['downtown, suburbs, and rural areas', 'all major districts', 'key swing regions']),
        '{topics}': getRandomItem(['economic development', 'education and healthcare', 'community safety and infrastructure']),
        '{actions}': getRandomItem(['addressed concerns about local issues', 'discussed policy proposals', 'listened to community feedback']),
        '{attendees}': getRandomItem(['over 200 local residents', 'community leaders and activists', 'business owners and workers']),
        '{ad_title}': getRandomItem(['Building Our Future', 'Community First', 'Real Solutions', 'Working Together']),
        '{duration}': getRandomNumber(30, 60),
        '{theme}': getRandomItem(['community values', 'economic opportunity', 'public safety', 'education excellence']),
        '{features}': getRandomItem(['local residents sharing their stories', 'candidate discussing key policies', 'community landmarks and businesses']),
        '{networks}': getRandomItem(['major local networks', 'cable news channels', 'streaming platforms']),
        '{location}': getRandomItem(['Springfield', 'Riverside', 'Downtown', 'Westside', 'North District']),
        '{hashtags}': getRandomItem(['#CommunityFirst', '#RealChange', '#WorkingTogether', '#FutureForward']),
        '{group}': getRandomItem(['local business owners', 'teachers and parents', 'healthcare workers', 'senior citizens']),
        '{years}': getRandomNumber(5, 25),
        '{field}': getRandomItem(['public service', 'business management', 'community development', 'policy analysis']),
        '{policy_area}': getRandomItem(['economic development', 'education reform', 'environmental protection', 'public safety'])
    };

    let result = template;
    for (const [placeholder, replacement] of Object.entries(replacements)) {
        result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    return result;
}

// Generate fake news article
function generateNewsArticle(candidate) {
    const sentiment = getRandomItem(['positive', 'negative', 'neutral']);
    let template;
    
    switch (sentiment) {
        case 'positive':
            template = getRandomItem(positiveNewsTemplates);
            break;
        case 'negative':
            template = getRandomItem(negativeNewsTemplates);
            break;
        default:
            template = getRandomItem(neutralNewsTemplates);
    }

    return {
        candidate_id: candidate.id,
        title: replacePlaceholders(template.title, candidate),
        content: replacePlaceholders(template.content, candidate),
        source: getRandomItem(newsSources),
        sentiment: sentiment,
        category: getRandomItem(newsCategories)
    };
}

// Generate social media post
function generateSocialPost(candidate) {
    const template = getRandomItem(socialMediaTemplates);
    return {
        candidate_id: candidate.id,
        platform: template.platform,
        content: replacePlaceholders(template.content, candidate),
        likes: getRandomNumber(50, 5000),
        shares: getRandomNumber(10, 500),
        comments: getRandomNumber(5, 200)
    };
}

// Database service functions
const fakeNewsService = {
    async generateNewsForCandidate(candidateId) {
        try {
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            
            const candidate = candidateResult.rows[0];
            const newsArticle = generateNewsArticle(candidate);
            
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
    },

    async generateSocialPostForCandidate(candidateId) {
        try {
            const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
            if (candidateResult.rows.length === 0) {
                throw new Error('Candidate not found');
            }
            
            const candidate = candidateResult.rows[0];
            const socialPost = generateSocialPost(candidate);
            
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
    },

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
    },

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
    },

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
    },

    async populateInitialNews() {
        try {
            const candidates = await pool.query('SELECT * FROM candidates');
            
            for (const candidate of candidates.rows) {
                // Generate 3-5 news articles per candidate
                const newsCount = getRandomNumber(3, 5);
                for (let i = 0; i < newsCount; i++) {
                    await this.generateNewsForCandidate(candidate.id);
                }
                
                // Generate 2-4 social media posts per candidate
                const socialCount = getRandomNumber(2, 4);
                for (let i = 0; i < socialCount; i++) {
                    await this.generateSocialPostForCandidate(candidate.id);
                }
            }
            
            console.log('Initial news and social media content generated successfully');
        } catch (error) {
            console.error('Error populating initial news:', error);
            throw error;
        }
    },

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
                targetSentiment = targetSentiment || ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)];
                strength = Math.floor(Math.random() * 5) + 1;
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
    },

    // Generate targeted news content based on sentiment and strength
    generateTargetedNewsContent(candidate, sentiment, strength) {
        const templates = this.newsTemplates[sentiment];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
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
            source: this.sources[Math.floor(Math.random() * this.sources.length)],
            sentiment: sentiment,
            category: this.categories[Math.floor(Math.random() * this.categories.length)]
        };
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
    },

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
                    strength = Math.floor(Math.random() * 3) + 7; // 7-9 strength
                } else if (candidate.party === userVote.candidate_party) {
                    // Same party - slightly positive
                    preferenceType = 'positive';
                    strength = Math.floor(Math.random() * 3) + 4; // 4-6 strength
                } else {
                    // Different party - negative preference
                    preferenceType = 'negative';
                    strength = Math.floor(Math.random() * 3) + 4; // 4-6 strength
                }

                await this.updateUserPreference(userCnp, candidate.id, preferenceType, strength);
            }

            console.log(`Generated initial preferences for user ${userCnp}`);
        } catch (error) {
            console.error('Error generating initial user preferences:', error);
            throw error;
        }
    },

    // Generate random preferences for users without voting history
    async generateRandomPreferences(userCnp) {
        try {
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            const candidates = candidatesResult.rows;

            for (const candidate of candidates) {
                const preferenceType = ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)];
                const strength = Math.floor(Math.random() * 5) + 1;
                
                await this.updateUserPreference(userCnp, candidate.id, preferenceType, strength);
            }

            console.log(`Generated random preferences for user ${userCnp}`);
        } catch (error) {
            console.error('Error generating random preferences:', error);
            throw error;
        }
    },

    // Generate targeted news for all users
    async generateTargetedNewsForAllUsers() {
        try {
            const usersResult = await pool.query('SELECT cnp FROM users');
            const candidatesResult = await pool.query('SELECT * FROM candidates');
            
            for (const user of usersResult.rows) {
                for (const candidate of candidatesResult.rows) {
                    // Generate 1-3 news articles per candidate per user
                    const articleCount = Math.floor(Math.random() * 3) + 1;
                    
                    for (let i = 0; i < articleCount; i++) {
                        await this.generateUserTargetedNews(user.cnp, candidate.id);
                    }
                }
            }
            
            console.log('Generated targeted news for all users');
        } catch (error) {
            console.error('Error generating targeted news for all users:', error);
            throw error;
        }
    },

    // Helper method to get random item from array
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

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
};

module.exports = fakeNewsService; 