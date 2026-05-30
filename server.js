// server.js - Express backend with MongoDB (Mongoose)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Appointment model
const Appointment = require('./models/Appointment');

// --- API Routes ---

// Get all appointments (most recent first)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = await Appointment.create({
      name: req.body.name,
      phone: req.body.phone,
      message: req.body.message || '',
      status: 'Pending',
    });
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
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
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
