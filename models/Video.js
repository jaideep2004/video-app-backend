import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: true
  },
  resolution: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  customUploadDate: {
    type: Date,
    required: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: false
  },
  categories: {
    type: [String],
    required: false
  }
});

export default mongoose.model('Video', videoSchema);