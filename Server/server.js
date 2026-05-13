const db = require('./db');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const offersRoutes = require('./routes/offersRoutes');
const commonRoutes = require('./routes/commonRoutes');

const path = require('path');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/common', commonRoutes);


// Test DB Route
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SHOW TABLES');
    res.json({ success: true, tables: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/check-env', (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
  });
});

// ✅ THIS WAS COMMENTED OUT — NOW FIXED!
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${DB_HOST+':'+PORT}`);
});