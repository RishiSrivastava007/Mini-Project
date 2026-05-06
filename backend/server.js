require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import routes (to be created)
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const path = require('path');
// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all to serve React app for non-API routes
app.get(/(.*)/, (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
