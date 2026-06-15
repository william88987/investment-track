import express from 'express';
import { z } from 'zod';
import { TotalAssetsHistoryModel, CreateTotalAssetsHistoryData } from '../models/TotalAssetsHistory.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { Logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

const createRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  investmentTotal: z.number(),
  bankTotal: z.number(),
  otherTotal: z.number(),
  total: z.number()
});

// Get total assets history for user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || 0;
    const history = await TotalAssetsHistoryModel.findByUserId(userId);
    return res.json(history);
  } catch (error) {
    Logger.error('Get total assets history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create total assets history record
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || 0;
    const validatedData = createRecordSchema.parse(req.body);
    
    const record = await TotalAssetsHistoryModel.create(userId, validatedData as CreateTotalAssetsHistoryData);
    return res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    Logger.error('Create total assets history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a history record
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || 0;
    const id = parseInt(req.params.id || '');
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const success = await TotalAssetsHistoryModel.delete(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    return res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    Logger.error('Delete total assets history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
