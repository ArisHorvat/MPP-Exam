const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schema);
        
        console.log('Database initialized successfully!');
        
        // Test the connection by getting candidates
        const result = await pool.query('SELECT COUNT(*) as count FROM candidates');
        console.log(`Found ${result.rows[0].count} candidates in database`);
        
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