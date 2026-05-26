import { Router } from 'express';
import { NotificacionController } from './controller/NotificacionController.js';

const router = Router();

router.get('/usuario/:usuarioId/no-leidas', NotificacionController.getNoLeidas);
router.get('/usuario/:usuarioId/leidas', NotificacionController.getLeidas);
router.patch('/:id/marcar-leida', NotificacionController.marcarComoLeida);

export default router;
