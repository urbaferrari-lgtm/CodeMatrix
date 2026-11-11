import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createFileSchema, updateFileSchema } from '../validators/file.validator';

const router = Router();

router.use(authenticate);

router.get('/:projectId', FileController.getFiles);
router.post('/', validate(createFileSchema), FileController.create);
router.put('/:fileId', validate(updateFileSchema), FileController.updateContent);
router.delete('/:fileId', FileController.delete);

export default router;

