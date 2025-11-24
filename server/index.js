require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const db = require('./queries');

const { router: authRoutes } = require('./routes/auth.js');

// pgsql
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// other
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({ info: 'Node.js, Express, and Postgres API' })
})

app.use("/api/auth", authRoutes);

app.listen(8080, () => {
      console.log('server listening on port 8080')
})

/*
app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

*/

/*
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE lists (
    todo_id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
    content VARCHAR(500) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE
);

remember to add:
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE lists TO me;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO me;
to psql

*/