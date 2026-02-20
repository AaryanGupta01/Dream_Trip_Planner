const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = 'bharat_explorer_secret_key_2024'; 

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('.'))

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/bharat_explorer')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Database Schemas ---

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true 
    },
    itinerary: [{ 
        type: Number // Storing the IDs corresponding to the DESTINATIONS array in frontend
    }] 
});

const User = mongoose.model('User', UserSchema);

// Authentication Middleware 

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied. No token provided.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};

// --- API Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, userId: user._id });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

/**
 * @route   GET /api/itinerary
 * @desc    Get current user's itinerary
 */
app.get('/api/itinerary', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching itinerary' });
    }
});

/**
 * @route   POST /api/itinerary
 * @desc    Add a destination ID to user's itinerary
 */
app.post('/api/itinerary', authenticate, async (req, res) => {
    try {
        const { destId } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user.itinerary.includes(destId)) {
            user.itinerary.push(destId);
            await user.save();
        }
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error updating itinerary' });
    }
});

/**
 * @route   DELETE /api/itinerary/:id
 * @desc    Remove a destination ID from user's itinerary
 */
app.delete('/api/itinerary/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.itinerary = user.itinerary.filter(id => id !== parseInt(req.params.id));
        await user.save();
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error deleting from itinerary' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Bharat Explorer Backend running on http://localhost:${PORT}`);
});