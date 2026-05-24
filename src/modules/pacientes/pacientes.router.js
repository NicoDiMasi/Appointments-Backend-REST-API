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

router
  .route('/:id/turnos')
  .get(PacienteController.consultarHistorialTurnos)
  .post(PacienteController.reservarTurno);

router //VER REST
  .route('/:id/turnos/:turnoId/cancelacion')
  .patch(PacienteController.cancelarTurno);

router //VER REST
  .route('/:id/turnos/:turnoId/cambio')
  .patch(PacienteController.cambiarTurno);

export default router;
