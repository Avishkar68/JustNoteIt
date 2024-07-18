const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.createAccount = async (req, res) => {
    console.log("Received request to create account:", req.body);
    const { fullName, email, password } = req.body;

    if (!fullName) {
        return res.status(400).json({ error: true, message: "Full name is required" });
    }
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ error: true, message: "Password is required" });
    }

    const isUser = await User.findOne({ email });

    if (isUser) {
        return res.json({ error: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();

    const accessToken = jwt.sign({ user: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return res.json({ error: false, user, accessToken, message: "Registration Successful" });
};


exports.getUser = async (req, res) => {
    console.log("Received request to get user data.");
    console.log("Decoded user from token:", req.user);

    const userId = req.user._id; // Access _id directly from req.user

    try {
        const userData = await User.findById(userId);

        if (!userData) {
            console.log("User not found in database.");
            return res.status(404).json({
                error: true,
                message: "User not found",
            });
        }

        console.log("User data retrieved successfully:", userData);

        return res.status(200).json({
            error: false,
            user: userData,
            message: "User retrieved successfully",
        });

    } catch (error) {
        console.error("Error retrieving user data:", error.message);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};


exports.loginUser = async (req, res) => {
  console.log("Received login request:", req.body);
  const { email, password } = req.body;

  if (!email) {
      return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
      return res.status(400).json({ message: "Password is required" });
  }

  const userInfo = await User.findOne({ email });

  if (!userInfo) {
      return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, userInfo.password);

  if (isMatch) {
      const user = { user: userInfo._id };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

      res.cookie('token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      return res.json({ error: false, message: "Login successful", email, accessToken });
  } else {
      return res.status(400).json({ error: true, message: "Invalid credentials" });
  }
};