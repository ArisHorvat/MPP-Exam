const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const fakeNewsService = require('../services/fakeNewsGenerator');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schema);
        
        console.log('Database schema created successfully!');
        
        // Test the connection by getting candidates
        const result = await pool.query('SELECT COUNT(*) as count FROM candidates');
        console.log(`Found ${result.rows[0].count} candidates in database`);
        
        // Create test users
        console.log('Creating test users...');
        const testUsers = [
            { name: 'John Doe', cnp: '12345' },
            { name: 'Jane Smith', cnp: '67890' },
            { name: 'Bob Johnson', cnp: '11111' }
        ];
        
        for (const user of testUsers) {
            try {
                await pool.query(`
                    INSERT INTO users (name, cnp) 
                    VALUES ($1, $2) 
                    ON CONFLICT (cnp) DO NOTHING
                `, [user.name, user.cnp]);
                console.log(`Created user: ${user.name} (CNP: ${user.cnp})`);
            } catch (error) {
                console.log(`User ${user.name} already exists or error: ${error.message}`);
            }
        }
        
        // Generate initial fake news and social media content
        console.log('Generating initial fake news and social media content...');
        await fakeNewsService.populateInitialNews();
        
        // Generate initial user preferences and targeted news
        console.log('Generating initial user preferences and targeted news...');
        await fakeNewsService.generateTargetedNewsForAllUsers();
        
        console.log('Database initialized successfully!');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase; 