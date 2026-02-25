const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticate = require('../middleware/auth');

/*
   GET /api/itinerary
   Fetch the logged-in user's saved trip destinations
 */
router.get('/', authenticate, async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Return the array of destination IDs
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching itinerary from database' });
    }
});

/*
    POST /api/itinerary
    Add a new destination to the user's trip plan
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { destId } = req.body;
        const user = await User.findById(req.user.userId);

        // Only add if the ID isn't already in the itinerary array to prevent duplicates
        if (!user.itinerary.includes(destId)) {
            user.itinerary.push(destId);
            await user.save();
        }
        
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error updating itinerary' });
    }
});

/*
   DELETE /api/itinerary/:id
   Remove a destination from the user's trip plan
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Filter out the destination ID provided in the URL parameters
        user.itinerary = user.itinerary.filter(id => id !== parseInt(req.params.id));
        await user.save();
        
        res.json(user.itinerary);
    } catch (err) {
        res.status(500).json({ error: 'Error deleting destination from itinerary' });
    }
});

module.exports = router;