import { Router } from 'express';
import { MedicoController } from './controller/MedicoController.js';

const router = Router();

router
  .route('/')
  .get(MedicoController.findAll)
  .post(MedicoController.create);

router
  .route('/:medicoId')
  .get(MedicoController.findById);

router
  .route('/:medicoId/servicios')
  .get(MedicoController.listarServicios)
  .post(MedicoController.agregarServicio);

router
  .route('/:medicoId/servicios/:tipo/:servicioId')
  .patch(MedicoController.actualizarServicio)
  .delete(MedicoController.eliminarServicio);

router
  .route('/:medicoId/disponibilidades')
  .get(MedicoController.listarDisponibilidades)
  .post(MedicoController.agregarDisponibilidad);

router
  .route('/:medicoId/disponibilidades/:diaSemana')
  .patch(MedicoController.actualizarDisponibilidad)
  .delete(MedicoController.eliminarDisponibilidad);

router
  .route('/:medicoId/disponibilidades-turnos')
  .get(MedicoController.consultarDisponibilidadTurno);

router
  .route('/:medicoId/pacientes/:pacienteId/turnos')
  .get(MedicoController.consultarTurnosDePaciente);

router
  .route('/:medicoId/turnos/:turnoId')
  .patch(MedicoController.actualizarTurno);

export default router;
