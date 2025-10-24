import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await connectDB();
    
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Username: ${user.username}, IsAdmin: ${user.isAdmin}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

checkUsers();