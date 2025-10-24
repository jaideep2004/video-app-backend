import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

const adminUser = {
  username: 'admin2@gmail.com',
  password: 'admin@321',
  isAdmin: true
};

const seedAdminUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Delete existing admin users
    await User.deleteMany({ isAdmin: true });
    
    // Create admin user - let the pre-save hook handle password hashing
    const user = new User({
      username: adminUser.username,
      password: adminUser.password,
      isAdmin: adminUser.isAdmin
    });
    
    await user.save();
    
    console.log('Admin user created successfully!');
    console.log('Username:', adminUser.username);
    console.log('Password:', adminUser.password);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdminUser();