import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Set FFmpeg path if needed (for production environments)
const ffmpegPath = process.env.FFMPEG_PATH;
const ffprobePath = process.env.FFPROBE_PATH;

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

if (ffprobePath) {
  ffmpeg.setFfprobePath(ffprobePath);
}

// Get video metadata
export const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      reject(new Error('Video file not found'));
      return;
    }
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        reject(new Error(`Failed to extract metadata: ${err.message}`));
        return;
      }
      
      if (!metadata || !metadata.format) {
        reject(new Error('Invalid video metadata'));
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }
      
      const duration = metadata.format.duration ? Math.floor(metadata.format.duration) : 0;
      const resolution = videoStream.width && videoStream.height ? 
        `${videoStream.width}x${videoStream.height}` : 'N/A';
      const title = (metadata.format.tags?.title || path.parse(filePath).name || 'Untitled Video');
      
      resolve({
        title,
        duration,
        resolution
      });
    });
  });
};

// Generate thumbnail
export const generateThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    // Check if video file exists
    if (!fs.existsSync(videoPath)) {
      reject(new Error('Video file not found'));
      return;
    }
    
    // Ensure thumbnail directory exists
    const thumbnailDir = path.dirname(thumbnailPath);
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [Math.min(1, Math.floor(fs.statSync(videoPath).size / 1000000))], // Adjust timestamp based on file size
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '320x240'
      })
      .on('end', () => {
        // Check if thumbnail was created
        if (fs.existsSync(thumbnailPath)) {
          resolve();
        } else {
          reject(new Error('Thumbnail generation failed'));
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(new Error(`Failed to generate thumbnail: ${err.message}`));
      });
  });
};