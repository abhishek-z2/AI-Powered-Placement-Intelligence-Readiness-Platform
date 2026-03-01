const pool = require('./db/pool');

async function main() {
    try {
        const result = await pool.query('SELECT id, name, technical_skills, experience_years FROM students');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}

main();

