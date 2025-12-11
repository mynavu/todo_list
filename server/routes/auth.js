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
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: test
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or missing fields
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



// LOGIN
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: test
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
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

    res.status(200).json({ user: { id: user.id, username: user.username }});

})

// ME
// Data of the logged in user

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the logged-in user's information
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: test
 */
router.get('/me', protect, async (req, res) => {
    res.status(200).json({ user: req.user });

    // returns info of the logged in user from middleware
})

// Logout
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
    res.cookie('token', '', {...cookieOptions, maxAge: 1});
    res.status(200).json({ message: 'Logged out successfully'}); 
})


// SHOW LIST OF ALL USER
/**
 * @swagger
 * /api/auth/all_users:
 *   get:
 *     summary: Get a list of all registered users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users_list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: test
 */ 
router.get('/all_users', protect, async (req, res) => {

    const users_list = await userRepo.find();

    res.status(200).json({ users_list });
});

module.exports = {
    router
}