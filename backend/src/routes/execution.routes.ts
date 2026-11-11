import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { runCodeSchema } from '../validators/execution.validator';

const router = Router();

router.use(authenticate);
router.post('/run', validate(runCodeSchema), ExecutionController.run);

export default router;
