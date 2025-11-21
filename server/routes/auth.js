const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const pool = db.pool;
const router = express.Router();
const { protect } = require('../middleware/auth.js');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
}

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

// REGISTER
router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide all required fields'});
    }
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
        [username, hashedPassword]
    );
    const token = generateToken(newUser.rows[0].id)
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({ user: newUser.rows[0] });
})

// LOGIN

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide all required fields'});
    }

    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials'});
    }

    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(userData.id);
    res.cookie('token', token, cookieOptions);

    res.json({ user: { id: userData.id, username: userData.username }});

})

// ME
// Data of the logged in user
router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });

    // returns info of the logged in user from middleware
})

// Logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {...cookieOptions, maxAge: 1});
    res.json({ message: 'Logged out successfully'}); 
})



// SHOW LIST OF USER
router.get('/list', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'No username provided' });
    const lists = await pool.query('SELECT * FROM lists WHERE username = $1', [username]);
    res.json({ list: lists.rows });
});

// ADD A TO DO
router.post('/add_todo', async (req, res) => {
    console.log('ADD_TODO ROUTE HIT', req.body);
    const { username, content } = req.body;
    if (!username || !content) {
        return res.status(400).json({ message: 'Information is missint'});
    }

    const lists = await pool.query(
    'INSERT INTO lists (username, content) VALUES ($1, $2) RETURNING todo_id, username, content, date, completed',
    [username, content]
    );
    res.json({ new_row: lists.rows[0] });


})

// DELETE A TO DO
router.post('/delete_todo', async (req, res) => {
    const { username, todo_id} = req.body;
    try {
        await pool.query(
            'DELETE FROM lists WHERE username = $1 AND todo_id = $2',
            [username, todo_id]
        );

        res.json({ deleted: { username, todo_id }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})

// TOGGLE todo
router.post('/toggle_todo', async (req, res) => {
    const { username, todo_id, completed} = req.body;
    try {
        await pool.query(
            'UPDATE lists SET completed = $3 WHERE username = $1 AND todo_id = $2',
        [username, todo_id, completed]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})

module.exports = {
    router
}