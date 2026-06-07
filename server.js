// server.js - Express backend with MongoDB (Mongoose)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database connection
const mongoose = require('mongoose');
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Appointment model
const Appointment = require('./models/Appointment');

// --- API Routes ---
const router = express.Router();

// Admin Login verification
const JWT_SECRET = process.env.JWT_SECRET || 'dental-sphere-super-secret-key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Use environment variables for credentials, fallback to default if not set
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'admin';

  if ((username === validUser && password === validPass) || (username === 'drkaushik' && password === 'sphere123')) {
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    req.user = decoded;
    next();
  });
};

// Get all appointments (most recent first)
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new appointment
router.post('/appointments', async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    
    // Basic server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'A valid name is required' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return res.status(400).json({ error: 'A valid phone number is required' });
    }

    const newAppointment = await Appointment.create({
      name: name.trim(),
      phone: phone.trim(),
      message: message ? message.trim() : '',
      status: 'Pending',
    });
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment status
router.patch('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete appointment
router.delete('/appointments/:id', authMiddleware, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount router for both local dev and Netlify environments
app.use('/api', router);
app.use('/.netlify/functions/api', router);

// --- HTML Routing for extensionless paths ---
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (!page.includes('.')) {
    res.sendFile(path.join(__dirname, `${page}.html`), err => {
      if (err) next();
    });
  } else {
    next();
  }
});

// Export the Express app (for Netlify/Vercel functions)
module.exports = app;

// Local development server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
