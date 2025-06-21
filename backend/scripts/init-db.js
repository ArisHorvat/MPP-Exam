const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const fakeNewsGenerator = require('../services/fakeNewsGenerator');

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
            { name: 'Bob Johnson', cnp: '11111' },
            { name: 'Alice Brown', cnp: '22222' },
            { name: 'Charlie Wilson', cnp: '33333' },
            { name: 'Diana Davis', cnp: '44444' },
            { name: 'Edward Miller', cnp: '55555' },
            { name: 'Fiona Garcia', cnp: '66666' },
            { name: 'George Martinez', cnp: '77777' },
            { name: 'Helen Rodriguez', cnp: '88888' }
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
        
        // Generate initial fake news
        console.log('Generating initial fake news...');
        await fakeNewsGenerator.populateInitialNews();
        
        // Generate targeted news for all users with varied sentiments
        console.log('Generating targeted news for all users...');
        await fakeNewsGenerator.generateTargetedNewsForAllUsers();
        
        console.log('Database initialization completed successfully!');
        
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