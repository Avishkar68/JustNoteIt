const jwt = require('jsonwebtoken');
const User = require('../backend/models/user.model');

exports.authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Get the token from cookies
        if (!token) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded.user);

        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
