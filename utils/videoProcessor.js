import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

// Get video metadata
export const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      
      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }
      
      const duration = Math.floor(metadata.format.duration);
      const resolution = `${videoStream.width}x${videoStream.height}`;
      const title = metadata.format.tags?.title || path.parse(filePath).name;
      
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
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [1],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '320x240'
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
};