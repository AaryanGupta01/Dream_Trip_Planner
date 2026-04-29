require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itinerary');
const travelHistoryRoutes = require('./routes/travelHistory');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/travel-history', travelHistoryRoutes);

// MongoDB Connection
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bharat_explorer';

mongoose.connect(DB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.listen(PORT, () => {
    console.log(`🚀 Bharat Explorer Backend running on http://localhost:${PORT}`);
});