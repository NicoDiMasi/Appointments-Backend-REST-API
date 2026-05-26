import { Router } from 'express';
import { NotificacionController } from './controller/NotificacionController.js';

const router = Router();

router.get('/usuarios/:usuarioId', NotificacionController.getByUsuario);
router.patch('/:id/leida', NotificacionController.marcarComoLeida);

export default router;
