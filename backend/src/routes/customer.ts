import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import pool from '../config/db';
import { AuthRequest } from '../types';
import {
  getMyTickets,
  getMyTicket,
  selectOption,
  getProfile,
  updateProfile,
} from '../controllers/customerController';

const router = Router();

router.use(authenticate, requireRole('customer'));

// A customer deactivated (or deleted) by the admin is locked out straight away
router.use(async (req: AuthRequest, res, next) => {
  const r = await pool.query(`SELECT is_active FROM users WHERE id = $1 AND role = 'customer'`, [req.user!.id]);
  if (!r.rows[0]?.is_active) {
    res.status(401).json({ error: 'Your account is not active' });
    return;
  }
  next();
});

router.get('/tickets', getMyTickets);
router.get('/tickets/:id', getMyTicket);
router.post('/tickets/:id/select', selectOption);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

export default router;
