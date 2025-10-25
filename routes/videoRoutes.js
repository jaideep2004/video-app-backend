import express from 'express';
import { 
  uploadVideo, 
  getAllVideos, 
  getVideoById, 
  deleteVideo,
  incrementViewCount, 
  likeVideo,
  searchVideos,
  updateVideo
} from '../controllers/videoController.js';
import { upload, handleMulterError } from '../middleware/upload.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/search', searchVideos);
router.get('/:id', getVideoById);
router.patch('/:id/view', incrementViewCount);
router.patch('/:id/like', likeVideo);

// Protected routes (admin only)
router.post('/upload', authenticate, authorizeAdmin, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), handleMulterError, uploadVideo);
router.put('/:id', authenticate, authorizeAdmin, upload.single('thumbnail'), handleMulterError, updateVideo);
router.delete('/:id', authenticate, authorizeAdmin, deleteVideo);

export default router;