const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        const verified = jwt.verify(token, secret);
        req.user = verified;

        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid or Expired Token' });
    }
};

// Exporting the function so it can be used in routes/itinerary.js
module.exports = authenticate;