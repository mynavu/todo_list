const jwt = require('jsonwebtoken');
const AppDataSource = require('../config/new_db.js');
const User = require('../entities/Users.js');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token"})
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await AppDataSource.getRepository(User).findOneBy({ id: decoded.id });

    if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found"});
    }

    req.user = user
    next();


  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = {
  protect
};
