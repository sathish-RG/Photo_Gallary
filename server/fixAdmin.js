const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config({ path: './.env' });

const fixAdmin = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const email = 'admin@example.com';
    const password = 'password123';

    let user = await User.findOne({ email });

    if (user) {
      console.log('Admin user found. Updating...');
      user.username = 'Admin User';
      user.password = password; // Will be hashed by pre-save hook
      user.isAdmin = true;
      user.isActive = true;
      await user.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log('Admin user not found. Creating...');
      user = await User.create({
        username: 'Admin User',
        email,
        password,
        isAdmin: true,
        isActive: true
      });
      console.log('Admin user created successfully.');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();
