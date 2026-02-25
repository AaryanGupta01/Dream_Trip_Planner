const mongoose = require('mongoose');

/* User Schema */
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

// Exporting the model so it can be used in routes auth.js and itinerary.js
module.exports = mongoose.model('User', UserSchema);