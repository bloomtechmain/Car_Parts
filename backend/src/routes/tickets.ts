import { Router } from 'express';
import { submitTicket, submitContactForm, getSelectionPreview, confirmSelection } from '../controllers/ticketController';

const router = Router();

router.post('/', submitTicket);
router.post('/contact', submitContactForm);
router.get('/select-option', getSelectionPreview);
router.post('/confirm-selection', confirmSelection);

export default router;
