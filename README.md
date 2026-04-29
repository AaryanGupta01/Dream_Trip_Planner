# 🌏 Bharat Explorer | AI-Powered Mood-Based Travel Planner

**Bharat Explorer** is a full-stack MERN application designed to simplify travel planning across India. Unlike traditional travel sites, it uses a **Mood-Based Discovery** engine and an **AI Route Optimizer** to help users find destinations that match their current vibe, budget, and season.

### 🔗 [Live Demo](https://dream-trip-planner.onrender.com/)

---

## ✨ Key Features

### 🎯 Smart Discovery
- **Mood Filters:** Filter destinations by vibe—🧗 Adventurous, 🧘 Relaxed, 🪔 Spiritual, or 🎉 Party.
- **Crowd Analytics:** Real-time visualization of "Peak" vs "Quiet" hours for every destination to help users avoid crowds.
- **Advanced Search:** Search by city, state, or specific tourist highlights.

### 🤖 AI Route Optimization
- **n8n AI Integration:** A floating AI panel that detects when a user has added 2+ cities to their trip.
- **Automated Itineraries:** Generates a curated 2-day guide and optimized travel route between selected cities using AI.

### 👥 Community & Social Proof
- **Travel Stories:** A public feed where logged-in users share their previous travel experiences.
- **Hotel Reviews:** Users can rate hotels (out of 5 stars), list amenities (WiFi, AC, etc.), and provide price range details.
- **Verified Recommendations:** Browse authentic reviews and ratings from other travelers to find the best stays.

### 🗺️ Live Navigation
- **One-Tap Navigation:** All restaurants and highlights are linked directly to **Google Maps Directions API**. Clicking a place name opens a navigation route from the user's current location to the destination.

---

## 🛠️ Tech Stack

**Frontend:**
- **HTML5/CSS3** with **Tailwind CSS** (for a modern, responsive UI).
- **Vanilla JavaScript** (State management and DOM manipulation).
- **FontAwesome** (Iconography).

**Backend:**
- **Node.js & Express** (RESTful API architecture).
- **JWT (JSON Web Tokens)** (Secure, stateless authentication).
- **Bcrypt.js** (Password hashing).

**Database & DevOps:**
- **MongoDB Atlas** (Cloud NoSQL database).
- **Mongoose** (Object Data Modeling).
- **n8n** (AI Workflow Automation).
- **Render** (Cloud Deployment).

---

## 🚀 Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/bharat-explorer.git
   cd bharat-explorer
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_random_secret_key
   ```

4. **Run the Application:**
   ```bash
   # For production
   npm start

   # For development (with nodemon)
   npm run dev
   ```

---

## 📸 Screen Previews

<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/516b634f-462b-4223-b7da-c62c5ddf86ed" />


## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by [Aaryan Gupta](https://github.com/AaryanGupta01)**
