import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { generateSchema } from '../validators/ai.validator';

const router = Router();

router.use(authenticate);
router.post('/generate', validate(generateSchema), AIController.generate);

export default router;
