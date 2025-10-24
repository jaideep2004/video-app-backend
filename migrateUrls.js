import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Video from './models/Video.js';
import connectDB from './config/db.js';

dotenv.config();

const migrateUrls = async () => {
  try {
    await connectDB();
    
    // Find all videos with relative URLs
    const videos = await Video.find({
      $or: [
        { fileUrl: { $regex: '^/uploads/videos/' } },
        { thumbnailUrl: { $regex: '^/uploads/thumbnails/' } }
      ]
    });
    
    console.log(`Found ${videos.length} videos to update`);
    
    for (const video of videos) {
      let updated = false;
      
      // Update fileUrl if it's relative
      if (video.fileUrl.startsWith('/uploads/videos/')) {
        video.fileUrl = `http://localhost:5000${video.fileUrl}`;
        updated = true;
      }
      
      // Update thumbnailUrl if it's relative
      if (video.thumbnailUrl.startsWith('/uploads/thumbnails/')) {
        video.thumbnailUrl = `http://localhost:5000${video.thumbnailUrl}`;
        updated = true;
      }
      
      if (updated) {
        await video.save();
        console.log(`Updated video ${video._id}`);
      }
    }
    
    console.log('URL migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating URLs:', error);
    process.exit(1);
  }
};

migrateUrls();