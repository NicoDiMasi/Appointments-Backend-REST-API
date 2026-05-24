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

router
  .route('/:medicoId/pacientes/:pacienteId/turnos')
  .get(MedicoController.consultarTurnosDePaciente);

router
  .route('/:medicoId/turnos/:turnoId')
  .patch(MedicoController.actualizarTurno);

export default router;
