const jwt = require('jsonwebtoken');
const User = require('../backend/models/user.model');

// exports.authenticateToken = async (req, res, next) => {
//     try {
//         const token = req.cookies.token; // Get the token from cookies
//         if (!token) {
//             return res.status(401).json({ message: 'Please login first' });
//         }

//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         req.user = await User.findById(decoded.user);

//         if (!req.user) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }

//         next();
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

exports.authenticateToken = async (req, res, next) => {
    try {
        console.log("Headers:", JSON.stringify(req.headers));
        console.log("Cookies object:", JSON.stringify(req.cookies));
        const token = req.cookies.token; // Get the token from cookies
        console.log("your token is: " + token);
        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

        if (!token) {
            return res.status(401).json({ error: true, message: 'Please login first' });
        }

        jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.log("erro is: " + err.message)
                return res.status(401).json({ error: true, message: 'Invalid or expired token' });
            }

            req.user = await User.findById(decoded.user);
            if (!req.user) {
                return res.status(401).json({ error: true, message: 'Invalid token: user not found' });
            }

            next();
        });
    } catch (error) {
        console.error("Error in token authentication:", error);
        res.status(500).json({ error: true, message: "Internal server error" });
    }
};