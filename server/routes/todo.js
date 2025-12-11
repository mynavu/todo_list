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

// SHOW LIST OF USER
/**
 * @swagger
 * /api/todo/list:
 *   get:
 *     summary: Get the to-do list of the logged-in user
 *     tags: [Todo]
 *     responses:
 *       200:
 *         description: To-do list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       todo_id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: test
 *                       content:
 *                         type: string
 *                         example: Sample to-do item
 *                       completed:
 *                         type: boolean
 *                         example: false
 *                       date_created:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-01T12:00:00Z
 *                       date_completed:
 *                         type: string
 *                         format: date-time
 *                         example: null
 */ 
router.get('/list', protect, async (req, res) => {

    const lists = await listRepo.find({
        where: {
            username: req.user.username
        }
    });

    res.status(200).json({ list: lists });
});

// ADD A TO DO
/**
 * @swagger
 * /api/todo/add_todo:
 *   post:
 *     summary: Add a new to-do item for the logged-in user
 *     tags: [Todo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Buy groceries
 *     responses:
 *       201:
 *         description: New to-do item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 new_row:
 *                   type: object
 *                   properties:
 *                     todo_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: test
 *                     content:
 *                       type: string
 *                       example: Buy groceries
 *                     completed:
 *                       type: boolean
 *                       example: false
 *                     date_created:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-01T12:00:00Z
 *                     date_completed:
 *                       type: string
 *                       format: date-time
 *                       example: null
 */
router.post('/add_todo', protect, async (req, res) => {
    const { content } = req.body;

    const todo = listRepo.create({
        username: req.user.username,
        content: content
    });

    await listRepo.save(todo);

    res.status(201).json({ new_row: todo });
})


// DELETE A TO DO
/**
 * @swagger
 * /api/todo/delete_todo:
 *   post:
 *     summary: Delete a to-do item for the logged-in user
 *     tags: [Todo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo_id
 *             properties:
 *               todo_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: To-do item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: test
 *                     todo_id:
 *                       type: integer
 *                       example: 1
 */
router.post('/delete_todo', protect, async (req, res) => {
    
    await listRepo.delete({
        username: req.user.username,
        todo_id: req.body.todo_id
    });

    res.status(200).json({ deleted: { username : req.user.username, todo_id: req.body.todo_id }});
});

// TOGGLE todo
/**
 * @swagger
 * /api/todo/toggle_todo:
 *   post:
 *     summary: Toggle the completion status of a to-do item for the logged-in user
 *     tags: [Todo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo_id
 *               - completed
 *             properties:
 *               todo_id:
 *                 type: integer
 *                 example: 1
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: To-do item completion status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date_completed:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-02T12:00:00Z
 *       404:
 *         description: To-do item not found
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

    res.status(200).json({ todo });

});


module.exports = {
    router
}