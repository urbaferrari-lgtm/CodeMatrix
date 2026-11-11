import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createProjectSchema } from '../validators/project.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

export default router;

