import Video from '../models/Video.js';
import { getVideoMetadata, generateThumbnail } from '../utils/videoProcessor.js';
import path from 'path';
import fs from 'fs';

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    // Check for video file in req.files when using upload.fields()
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // Get the first video file from the array
    const videoFile = req.files.video[0];
    const videoPath = videoFile.path;
    let thumbnailUrl = '';
    
    // Use uploaded thumbnail file if provided, otherwise generate one
    if (req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      thumbnailUrl = `https://video-backend.cloud/uploads/thumbnails/${thumbnailFile.filename}`;
    } else if (req.body.thumbnailUrl) {
      thumbnailUrl = req.body.thumbnailUrl;
    } else {
      // Ensure the thumbnails directory exists
      const thumbnailsDir = path.join('uploads', 'thumbnails');
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
      }
      
      const thumbnailPath = path.join(thumbnailsDir, `${path.parse(videoFile.filename).name}.png`);
      thumbnailUrl = `https://video-backend.cloud/uploads/thumbnails/${path.parse(videoFile.filename).name}.png`;
      // Generate thumbnail
      try {
        await generateThumbnail(videoPath, thumbnailPath);
      } catch (thumbError) {
        console.error('Thumbnail generation error:', thumbError);
        // If thumbnail generation fails, use a default thumbnail URL
        thumbnailUrl = `https://video-backend.cloud/uploads/thumbnails/default.png`;
      }
    }

    // Get video metadata
    let metadata;
    try {
      metadata = await getVideoMetadata(videoPath);
    } catch (metadataError) {
      console.error('Metadata extraction error:', metadataError);
      // If metadata extraction fails, use default values
      metadata = {
        title: req.body.title || path.parse(videoFile.originalname).name,
        duration: 0,
        resolution: 'N/A'
      };
    }

    // Process categories
    let categories = [];
    if (req.body.category) {
      // Split comma-separated categories and trim whitespace
      categories = req.body.category.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    }

    // Create video record with absolute URLs
    const video = new Video({
      title: req.body.title || metadata.title,
      description: req.body.description || '',
      category: req.body.category || '', // Store original string
      categories: categories, // Store as array
      duration: metadata.duration,
      resolution: metadata.resolution,
      fileUrl: `https://video-backend.cloud/uploads/videos/${videoFile.filename}`,
      thumbnailUrl: thumbnailUrl,
      uploadedBy: req.user.username,
      customUploadDate: req.body.customUploadDate ? new Date(req.body.customUploadDate) : new Date(),
      views: req.body.views ? parseInt(req.body.views) : 0
    });

    await video.save();
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up uploaded files if upload fails
    if (req.files) {
      if (req.files.video) {
        const videoPath = req.files.video[0].path;
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      }
      if (req.files.thumbnail) {
        const thumbnailPath = req.files.thumbnail[0].path;
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    }
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
};

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Get video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
};

// Delete video by ID
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Delete video file and thumbnail
    const videoPath = path.join('uploads/videos', path.basename(video.fileUrl));
    const thumbnailPath = path.join('uploads/thumbnails', path.basename(video.thumbnailUrl));
    
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    
    // Only delete thumbnail if it's a local file (not a custom URL)
    if (fs.existsSync(thumbnailPath) && video.thumbnailUrl.includes('uploads/thumbnails')) {
      fs.unlinkSync(thumbnailPath);
    }
    
    // Delete from database
    await Video.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};

// Increment view count
export const incrementViewCount = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error updating view count', error: error.message });
  }
};

// Like video
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error liking video', error: error.message });
  }
};

// Search videos by title
export const searchVideos = async (req, res) => {
  try {
    const { q } = req.query;
    const videos = await Video.find({
      title: { $regex: q, $options: 'i' }
    }).sort({ uploadedAt: -1 });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error searching videos', error: error.message });
  }
};

// Update video by ID
export const updateVideo = async (req, res) => {
  try {
    const { title, description, customUploadDate, views, category } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (customUploadDate !== undefined) updateData.customUploadDate = new Date(customUploadDate);
    if (views !== undefined) updateData.views = parseInt(views);
    if (category !== undefined) {
      updateData.category = category;
      // Process categories array
      updateData.categories = category.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
    }
    
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};