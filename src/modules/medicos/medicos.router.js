import { Router } from 'express';
import { MedicoController } from './controller/MedicoController.js';

const router = Router();

router.get('/:medicoId/disponibilidades', MedicoController.listarDisponibilidades);

router.post('/:medicoId/disponibilidades', MedicoController.agregarDisponibilidad);

router.patch(
    '/:medicoId/disponibilidades/:diaSemana',
    MedicoController.actualizarDisponibilidad
);

router.delete(
    '/:medicoId/disponibilidades/:diaSemana',
    MedicoController.eliminarDisponibilidad
);

export default router;