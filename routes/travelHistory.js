const express = require('express');
const router = express.Router();
const TravelExperience = require('../models/travelExperience');
const User = require('../models/user');
const authenticate = require('../middleware/auth');

/*
   POST /api/travel-history
   Add a new travel experience with rating and review
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { hotelName, city, state, rating, review, visitDate, highlights, amenities, price, imageUrl } = req.body;

        // Validation
        if (!hotelName || !city || !rating || !review || !visitDate) {
            return res.status(400).json({ error: 'Missing required fields: hotelName, city, rating, review, visitDate' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Get user details
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create new travel experience
        const newExperience = new TravelExperience({
            userId: req.user.userId,
            userName: user.email.split('@')[0], // Extract username from email
            hotelName,
            city,
            state,
            rating,
            review,
            visitDate: new Date(visitDate),
            highlights: highlights || [],
            amenities: amenities || [],
            price,
            imageUrl
        });

        const savedExperience = await newExperience.save();
        res.status(201).json({ 
            message: 'Travel experience added successfully', 
            experience: savedExperience 
        });
    } catch (err) {
        console.error('Error adding travel experience:', err);
        res.status(500).json({ error: 'Error adding travel experience' });
    }
});

/*
   GET /api/travel-history
   Get all travel experiences (visible to all logged-in users)
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const experiences = await TravelExperience.find()
            .select('userName hotelName city state rating review visitDate highlights amenities price imageUrl createdAt')
            .sort({ createdAt: -1 });

        res.json({ 
            total: experiences.length,
            experiences 
        });
    } catch (err) {
        console.error('Error fetching travel experiences:', err);
        res.status(500).json({ error: 'Error fetching travel experiences' });
    }
});

/*
   GET /api/travel-history/my-experiences
   Get logged-in user's travel experiences (MUST COME BEFORE /:userId)
 */
router.get('/my-experiences', authenticate, async (req, res) => {
    try {
        const experiences = await TravelExperience.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({ 
            total: experiences.length,
            experiences 
        });
    } catch (err) {
        console.error('Error fetching my experiences:', err);
        res.status(500).json({ error: 'Error fetching my experiences' });
    }
});

/*
   GET /api/travel-history/city/:city
   Get all travel experiences for a specific city
 */
router.get('/city/:city', authenticate, async (req, res) => {
    try {
        const { city } = req.params;
        const experiences = await TravelExperience.find({ city: { $regex: city, $options: 'i' } })
            .select('userName hotelName city state rating review visitDate highlights amenities price imageUrl createdAt')
            .sort({ rating: -1 });

        res.json({ 
            city,
            total: experiences.length,
            experiences 
        });
    } catch (err) {
        console.error('Error fetching city experiences:', err);
        res.status(500).json({ error: 'Error fetching city experiences' });
    }
});

/*
   GET /api/travel-history/hotel/:hotelName
   Get all reviews for a specific hotel
 */
router.get('/hotel/:hotelName', authenticate, async (req, res) => {
    try {
        const { hotelName } = req.params;
        const experiences = await TravelExperience.find({ hotelName: { $regex: hotelName, $options: 'i' } })
            .select('userName hotelName city state rating review visitDate highlights amenities price imageUrl createdAt')
            .sort({ rating: -1 });

        if (experiences.length > 0) {
            const avgRating = (experiences.reduce((sum, exp) => sum + exp.rating, 0) / experiences.length).toFixed(1);
            res.json({ 
                hotelName: experiences[0].hotelName,
                city: experiences[0].city,
                averageRating: avgRating,
                totalReviews: experiences.length,
                experiences 
            });
        } else {
            res.json({ 
                hotelName,
                averageRating: 0,
                totalReviews: 0,
                experiences: [] 
            });
        }
    } catch (err) {
        console.error('Error fetching hotel reviews:', err);
        res.status(500).json({ error: 'Error fetching hotel reviews' });
    }
});

/*
   GET /api/travel-history/user/:userId
   Get travel experiences of a specific user
 */
router.get('/user/:userId', authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const experiences = await TravelExperience.find({ userId })
            .select('userName hotelName city state rating review visitDate highlights amenities price imageUrl createdAt')
            .sort({ createdAt: -1 });

        res.json({ 
            total: experiences.length,
            experiences 
        });
    } catch (err) {
        console.error('Error fetching user experiences:', err);
        res.status(500).json({ error: 'Error fetching user experiences' });
    }
});

/*
   PUT /api/travel-history/:experienceId
   Update user's own travel experience
 */
router.put('/:experienceId', authenticate, async (req, res) => {
    try {
        const { experienceId } = req.params;
        const experience = await TravelExperience.findById(experienceId);

        if (!experience) {
            return res.status(404).json({ error: 'Travel experience not found' });
        }

        // Verify ownership
        if (experience.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to update this experience' });
        }

        // Update fields
        const { hotelName, city, state, rating, review, highlights, amenities, price, imageUrl } = req.body;
        
        if (hotelName) experience.hotelName = hotelName;
        if (city) experience.city = city;
        if (state) experience.state = state;
        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }
            experience.rating = rating;
        }
        if (review) experience.review = review;
        if (highlights) experience.highlights = highlights;
        if (amenities) experience.amenities = amenities;
        if (price) experience.price = price;
        if (imageUrl) experience.imageUrl = imageUrl;

        experience.updatedAt = Date.now();
        const updatedExperience = await experience.save();

        res.json({ 
            message: 'Travel experience updated successfully', 
            experience: updatedExperience 
        });
    } catch (err) {
        console.error('Error updating travel experience:', err);
        res.status(500).json({ error: 'Error updating travel experience' });
    }
});

/*
   DELETE /api/travel-history/:experienceId
   Delete user's own travel experience
 */
router.delete('/:experienceId', authenticate, async (req, res) => {
    try {
        const { experienceId } = req.params;
        const experience = await TravelExperience.findById(experienceId);

        if (!experience) {
            return res.status(404).json({ error: 'Travel experience not found' });
        }

        // Verify ownership
        if (experience.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this experience' });
        }

        await TravelExperience.findByIdAndDelete(experienceId);
        res.json({ message: 'Travel experience deleted successfully' });
    } catch (err) {
        console.error('Error deleting travel experience:', err);
        res.status(500).json({ error: 'Error deleting travel experience' });
    }
});

module.exports = router;
