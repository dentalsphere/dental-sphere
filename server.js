require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'appointments.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper: Read Data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

// Helper: Write Data
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// --- API Routes ---

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await readData();
    // Sort by createdAt descending
    appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const appointments = await readData();
    const newAppointment = {
      _id: Date.now().toString(),
      name: req.body.name,
      phone: req.body.phone,
      message: req.body.message || '',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    await writeData(appointments);
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const appointments = await readData();
    const index = appointments.findIndex(app => app._id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    appointments[index].status = status;
    await writeData(appointments);
    res.json(appointments[index]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    let appointments = await readData();
    appointments = appointments.filter(app => app._id !== req.params.id);
    await writeData(appointments);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HTML Routing for extensionless paths ---
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (!page.includes('.')) {
    res.sendFile(path.join(__dirname, `${page}.html`), (err) => {
      if (err) next();
    });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
