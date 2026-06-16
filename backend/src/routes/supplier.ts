import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import upload from '../middleware/upload';
import {
  getTickets,
  getTicket,
  submitReply,
  getMyReplies,
} from '../controllers/supplierController';

const router = Router();

router.use(authenticate, requireRole('supplier'));

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/reply', upload.single('image'), submitReply);
router.get('/replies', getMyReplies);

export default router;
