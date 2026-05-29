const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const operationRoutes = require('./routes/operationRoutes');
const mathRoutes = require('./routes/mathRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection (defaulting to localhost:3000)
app.use(cors({
  origin: '*', // Allow all in dev, can be configured specifically later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/math', mathRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CalcMaster AI API is active' });
});

// Auto-run schema initialization
const initDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await db.query(sql);
      console.log('Database tables verified/created successfully.');
    } else {
      console.warn('Database schema.sql not found, skipping auto-migration.');
    }
  } catch (error) {
    console.error('Error during database table auto-initialization:', error);
    console.warn('Make sure PostgreSQL is running and credentials in .env are correct.');
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`CalcMaster AI backend running on port ${PORT}`);
  await initDatabase();
});
