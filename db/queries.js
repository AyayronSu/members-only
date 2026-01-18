const pool = require('./pool');

async function insertUser(first_name, last_name, username, password) {
    await pool.query(
        'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)',
        [first_name, last_name, username, password]
    );
}

async function getUserByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0];
}

async function getUserById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
}

async function updateUserStatus(userId) {
    await pool.query(
        'UPDATE users SET membership_status = TRUE WHERE id = $1',
        [userId]
    );
}

module.exports = { 
    insertUser,
    getUserByUsername,
    getUserById,
    updateUserStatus
};