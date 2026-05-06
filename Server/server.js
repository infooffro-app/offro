const express = require('express');
const app = express();
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/UserRoutes');
const shopRoutes = require('./routes/shopRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const offersRoutes = require('./routes/offersRoutes');


const path = require('path');

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/offers', offersRoutes);



// const PORT = process.env.PORT || 3000;
// const DB_HOST = process.env.DB_HOST || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on ${DB_HOST+':'+PORT}`);
// });
