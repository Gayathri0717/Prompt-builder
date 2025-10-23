const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  if(!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const userExists = await User.findOne({ email });
  if(userExists) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({ username, email, password });
  if(user) {
    res.status(201).json({ 
      user: { id: user._id, username: user.username, email: user.email },
      token: generateToken(user._id)
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc Login user
// @route POST /api/users/login
// @access Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(user && await user.matchPassword(password)) {
    res.json({ 
      user: { id: user._id, username: user.username, email: user.email },
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

module.exports = { registerUser, loginUser };
