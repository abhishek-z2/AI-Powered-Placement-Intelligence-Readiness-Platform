const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Try to load .env from different possible locations
const envPaths = [
    path.join(__dirname, '..', '..', '.env'), // Project root
    path.join(__dirname, '..', '.env'),       // server root
    path.join(__dirname, '.env'),            // db folder
    path.join(process.cwd(), '.env'),        // Current working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        envLoaded = true;
        console.log('Loaded .env from:', envPath);
        break;
    }
}

if (!envLoaded) {
    console.log('No .env file found, using environment variables');
    require('dotenv').config();
}

console.log('DB_PASSWORD value:', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_USER value:', JSON.stringify(process.env.DB_USER));
console.log('DB_HOST value:', JSON.stringify(process.env.DB_HOST));
console.log('DB_NAME value:', JSON.stringify(process.env.DB_NAME));

// Ensure password is always a string (not undefined, null, or number)
// Explicitly check and convert to ensure it's a valid string
let dbPassword = process.env.DB_PASSWORD;
if (dbPassword === undefined || dbPassword === null) {
    dbPassword = '';
} else {
    dbPassword = String(dbPassword);
}

console.log('Final password (first 2 chars):', dbPassword ? dbPassword.substring(0, 2) + '***' : '(empty)');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'placement_db',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
});

// Test the database connection on startup
pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err.message);
});

// Export a function to test connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
};

module.exports = pool;
module.exports.testConnection = testConnection;
