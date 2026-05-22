import { Router } from 'express';
import { MedicoController } from './controller/MedicoController.js';

const router = Router();

router
  .route('/:medicoId/disponibilidades')
  .get(MedicoController.listarDisponibilidades)
  .post(MedicoController.agregarDisponibilidad);

router
  .route('/:medicoId/disponibilidades/:diaSemana')
  .patch(MedicoController.actualizarDisponibilidad)
  .delete(MedicoController.eliminarDisponibilidad);

export default router;