const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('Testing database connection...');
    console.log('Connection string:', process.env.DATABASE_URL ? 'Found' : 'Missing');
    
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found in environment variables');
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false, // Temporarily disable SSL
        connectionTimeoutMillis: 30000, // 30 seconds
        idleTimeoutMillis: 30000,
        max: 1
    });

    try {
        console.log('Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Successfully connected to database!');
        
        const result = await client.query('SELECT NOW() as current_time');
        console.log('Current database time:', result.rows[0].current_time);
        
        client.release();
        await pool.end();
        console.log('Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'ETIMEDOUT') {
            console.log('\n🔍 Troubleshooting suggestions:');
            console.log('1. Check if Neon database is active');
            console.log('2. Try different SSL modes (sslmode=prefer, sslmode=disable)');
            console.log('3. Check your network/firewall settings');
            console.log('4. Try from a different network');
        }
        
        await pool.end();
    }
}

testConnection(); 