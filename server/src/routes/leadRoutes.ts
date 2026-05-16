import { Router } from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeads,
} from '../controllers/leadController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // all routes require login

router.get('/export', exportLeads);
router.get('/',       getLeads);
router.post('/',      createLead);
router.get('/:id',    getLeadById);
router.put('/:id',    updateLead);
router.delete('/:id', deleteLead);

export default router;