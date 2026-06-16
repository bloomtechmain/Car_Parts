import { Router } from 'express';
import { submitTicket, submitContactForm } from '../controllers/ticketController';

const router = Router();

router.post('/', submitTicket);
router.post('/contact', submitContactForm);

export default router;
