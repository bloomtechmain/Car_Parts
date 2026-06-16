import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  getTickets,
  getTicket,
  updateTicketStatus,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.patch('/tickets/:id/status', updateTicketStatus);

router.get('/suppliers', getSuppliers);
router.post('/suppliers', createSupplier);
router.patch('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

export default router;
