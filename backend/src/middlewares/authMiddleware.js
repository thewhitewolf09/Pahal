import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import Parent from '../models/parent.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      // Determine user role
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'parent') {
        req.user = await Parent.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized.' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized. Invalid token.' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized. No token provided.' });
  }
};
