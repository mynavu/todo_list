const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const pool = db.pool;

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token"})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await pool.query("SELECT id, username FROM users WHERE id = $1", [decoded.id]);

    if (user.rows.length === 0) {
        return res.status(401).json({ message: "Not authorized, user not found"});
    }

    req.user = user.rows[0]
    next();


  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = {
  protect
};
