import { Router } from 'express';
import { submitTicket, submitContactForm, getSelectionPreview, confirmSelection } from '../controllers/ticketController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Raising a part request requires a customer account
router.post('/', authenticate, requireRole('customer'), submitTicket);
router.post('/contact', submitContactForm);
// Email-link selection flow stays public (secured by the one-time token)
router.get('/select-option', getSelectionPreview);
router.post('/confirm-selection', confirmSelection);

export default router;
