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

async function insertMessage(title, text, userId) {
    await pool.query(
        'INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)',
        [title, text, userId]
    );
}

async function getAllMessages() {
    const { rows } = await pool.query(`
        SELECT messages.*, users.first_name, users.last_name
        FROM messages
        JOIN users ON messages.user_id = users.id
        ORDER BY timestamp DESC
        `);
        return rows;
}

async function deleteMessage(messageId) {
    await pool.query('DELETE FROM messages WHERE id = $1', [messageId]);
}

module.exports = { 
    insertUser,
    getUserByUsername,
    getUserById,
    updateUserStatus,
    insertMessage,
    getAllMessages,
    deleteMessage
};