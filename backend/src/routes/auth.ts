import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, registerCustomer, registerSupplier } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many attempts, please try again later.' },
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, registerCustomer);
router.post('/register-supplier', authLimiter, registerSupplier);
router.get('/me', authenticate, getMe);

export default router;
