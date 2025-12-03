import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const emailExist = await User.findOne({ email });
    if (emailExist) return res.status(400).json({ message: 'Email already exists' });

    const usernameExist = await User.findOne({ username });
    if (usernameExist) return res.status(400).json({ message: 'Username already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await user.save();
    
    // Create token
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);

    res.header('auth-token', token).json({ token, user: { id: savedUser._id, username: savedUser.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email is not found' });

    // Check password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: 'Invalid password' });

    // Create token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.header('auth-token', token).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
