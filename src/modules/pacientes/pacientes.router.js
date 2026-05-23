import { Router } from 'express';
import { PacienteController } from './controller/PacienteController.js';

const router = Router();

router
  .route('/')
  .get(PacienteController.findAll)
  .post(PacienteController.create);

router
  .route('/:id')
  .get(PacienteController.findById)
  .patch(PacienteController.update)
  .delete(PacienteController.delete);

export default router;
