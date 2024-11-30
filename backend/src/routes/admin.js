import express from 'express';

import { createAdmin, getAdminDetails, loginAdmin } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route - Create admin
router.post('/register', createAdmin);

// Public route - Admin login
router.post('/login', loginAdmin);

// Protected route - Get admin details
router.get('/me', protect, getAdminDetails);

export default router;
