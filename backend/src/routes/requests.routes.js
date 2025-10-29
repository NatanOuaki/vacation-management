import { Router } from 'express';
import {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus
} from '../controllers/requests.controller.js';

const router = Router();

// Requester
router.post('/requests', createRequest);
router.get('/requests/:userId', getUserRequests);

// Validator
router.get('/requests', getAllRequests);
router.patch('/requests/:id', updateRequestStatus);

export default router;
