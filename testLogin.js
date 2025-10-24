import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const testLogin = async () => {
  try {
    await connectDB();
    
    const user = await User.findOne({ username: 'admin2@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.username);
    console.log('Is admin:', user.isAdmin);
    
    // Test password comparison
    const isMatch = await user.comparePassword('admin@321');
    console.log('Password match:', isMatch);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
};

testLogin();