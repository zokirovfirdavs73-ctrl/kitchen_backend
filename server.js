require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const { Product, User } = require('./models');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
  res.send('QuickBite OMS API is running...');
});

const PORT = process.env.PORT || 1111;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  
  // Sync DB (Creates tables if they don't exist)
  try {
    // Force sync for development (removes 'force: true' in production)
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    
    // Seed initial products if empty
    const productCount = await Product.count();
    if (productCount === 0) {
      const defaultProducts = [
        { name: 'Classic Smash', price: 12.99, stock: 45, category: 'BURGERS', status: 'ACTIVE', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60' },
        { name: 'Crinkle Cut Fries', price: 4.50, stock: 120, category: 'SIDES', status: 'ACTIVE', image_url: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=60' },
        { name: 'Citrus Craft Soda', price: 3.99, stock: 88, category: 'DRINKS', status: 'LOW STOCK', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60' },
        { name: 'Buffalo Wings', price: 10.99, stock: 32, category: 'SIDES', status: 'ACTIVE', image_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=500&q=60' }
      ];
      await Product.bulkCreate(defaultProducts);
      console.log('Default products seeded.');
    }
    
    // Seed admin user if empty
    const userCount = await User.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('15102010', 10);
      await User.create({ username: 'firdavs', password: hashedPassword, role: 'Admin' });
      console.log('Admin user seeded.');
    }

  } catch (err) {
    console.error('Error syncing database:', err);
  }
});
