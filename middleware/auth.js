const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        const secret = process.env.JWT_SECRET;
        
        // DIAGNOSTIC CHECK 1: Is the secret actually loading?
        console.log("1. SECRET CHECK:", secret ? "Secret is loaded" : "SECRET IS MISSING/UNDEFINED!");
        // DIAGNOSTIC CHECK 2: What does the clean token look like?
        console.log("2. TOKEN CHECK:", token.substring(0, 15) + "..."); 

        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
        
    } catch (err) {
        // DIAGNOSTIC CHECK 3: The exact reason it crashed!
        console.log("3. THE REAL ERROR IS:", err.message); 
        res.status(400).json({ error: 'Invalid or Expired Token' });
    }
};

module.exports = authenticate;