const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const pool = db.pool;
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const AppDataSource = require('../config/new_db.js');
const List = require('../entities/Lists.js');
const User = require('../entities/Users.js');


// Initialize TypeORM Data Source
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

const listRepo = AppDataSource.getRepository(List);
const userRepo = AppDataSource.getRepository(User);

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

/*
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
*/

router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide all required fields'});
    }
    const userExists = await userRepo.findOne({
        where: {
            username: username
        }
    });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
        username: username,
        password: hashedPassword
    });

    await userRepo.save(newUser);
    const token = generateToken(newUser.id);
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({ user: { id: newUser.id, username: newUser.username } });
});

    /*
    const newUser = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
        [username, hashedPassword]
    );
    const token = generateToken(newUser.rows[0].id)
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({ user: newUser.rows[0] });
})

// LOGIN
/*
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
*/

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide all required fields'});
    }

    const user = await userRepo.findOne({
        where: {
            username: username
        }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials'});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);

    res.json({ user: { id: user.id, username: user.username }});

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

/*
router.get('/list', protect, async (req, res) => {

    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    console.log("REQ USER:", req.user);
    const lists = await pool.query('SELECT * FROM lists WHERE username = $1', [req.user.username]);
    res.json({ list: lists.rows });
});
*/

router.get('/list', protect, async (req, res) => {

    const lists = await listRepo.find({
        where: {
            username: req.user.username
        }
    });

    res.json({ list: lists });
});

// SHOW LIST OF ALL USER
router.get('/all_users', protect, async (req, res) => {

    const users_list = await userRepo.find();

    res.json({ users_list });
});

// ADD A TO DO
/*
router.post('/add_todo', protect, async (req, res) => {
    // console.log('ADD_TODO ROUTE HIT', req.body);
    const { content } = req.body;
    if (!req.user || !content) {
        return res.status(400).json({ message: 'Information is missint'});
    }
    const lists = await pool.query(
    'INSERT INTO lists (username, content) VALUES ($1, $2) RETURNING todo_id, username, content, date, completed',
    [req.user.username, content]
    );
    res.json({ new_row: lists.rows[0] });
})
*/


router.post('/add_todo', protect, async (req, res) => {
    const { content } = req.body;

    const todo = listRepo.create({
        username: req.user.username,
        content: content
    });

    await listRepo.save(todo);

    res.json({ new_row: todo });
})


// DELETE A TO DO
/*
router.post('/delete_todo', protect, async (req, res) => {
    const {todo_id} = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    try {
        await pool.query(
            'DELETE FROM lists WHERE username = $1 AND todo_id = $2',
            [req.user.username, todo_id]
        );
        res.json({ deleted: { username : req.user.username, todo_id }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})
*/

router.post('/delete_todo', protect, async (req, res) => {
    
    await listRepo.delete({
        username: req.user.username,
        todo_id: req.body.todo_id
    });

    res.json({ deleted: { username : req.user.username, todo_id: req.body.todo_id }});
});

// TOGGLE todo
/*
router.post('/toggle_todo', protect, async (req, res) => {
    const {todo_id, completed} = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    try {
        await pool.query(
            'UPDATE lists SET completed = $3 WHERE username = $1 AND todo_id = $2',
        [req.user.username, todo_id, completed]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

})
*/

router.post('/toggle_todo', protect, async (req, res) => {
    const {todo_id, completed} = req.body;

    const todo = await listRepo.findOne({
        where: {
            username: req.user.username,
            todo_id: todo_id
        }
    });

    if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
    }

    todo.completed = completed;
    if (completed) {
        todo.date_completed = new Date();
    } else {
        todo.date_completed = null;
    }
    await listRepo.save(todo);

    res.json({ success: true });
});


module.exports = {
    router
}