import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  getTickets,
  getTicket,
  updateTicketStatus,
  updateReplyAdminPrice,
  sendOptionsToCustomer,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getCustomers,
  getCustomerTickets,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getSupplierRequests,
  approveSupplierRequest,
  rejectSupplierRequest,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.patch('/tickets/:id/status', updateTicketStatus);
router.patch('/tickets/:id/replies/:replyId', updateReplyAdminPrice);
router.post('/tickets/:id/send-options', sendOptionsToCustomer);

router.get('/suppliers', getSuppliers);
router.post('/suppliers', createSupplier);
router.patch('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

router.get('/supplier-requests', getSupplierRequests);
router.post('/supplier-requests/:id/approve', approveSupplierRequest);
router.post('/supplier-requests/:id/reject', rejectSupplierRequest);

router.get('/customers', getCustomers);
router.post('/customers', createCustomer);
router.get('/customers/:id/tickets', getCustomerTickets);
router.patch('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

export default router;
