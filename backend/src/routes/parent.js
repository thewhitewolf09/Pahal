import express from 'express';
import {
  addParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
  loginParent,
} from '../controllers/parentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/', addParent);
router.post('/login', loginParent);


// Protected Routes
router.get('/', protect, getAllParents);
router.get('/:id', protect, getParentById);
router.patch('/:id', protect, updateParent);
router.delete('/:id', protect, deleteParent);

export default router;
