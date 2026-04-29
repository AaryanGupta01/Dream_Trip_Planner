const mongoose = require('mongoose');

/* Travel Experience Schema */
const TravelExperienceSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    hotelName: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    state: { 
        type: String 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5,
        validate: {
            validator: function(v) {
                return [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(v);
            },
            message: 'Rating must be between 1 and 5 (half-stars allowed)'
        }
    },
    review: { 
        type: String, 
        required: true 
    },
    visitDate: { 
        type: Date, 
        required: true 
    },
    highlights: { 
        type: [String] 
    },
    amenities: { 
        type: [String] 
    },
    price: { 
        type: String 
    },
    imageUrl: { 
        type: String 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Exporting the model
module.exports = mongoose.model('TravelExperience', TravelExperienceSchema);
