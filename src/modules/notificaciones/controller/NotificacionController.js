import { notificacionService } from '../service/NotificacionService.js';

export const NotificacionController = {
  async getNoLeidas(req, res, next) {
    try {
      const notificaciones = await notificacionService.getNoLeidas(req.params.usuarioId);
      return res.status(200).json(notificaciones);
    } catch (error) {
      return next(error);
    }
  },

  async getLeidas(req, res, next) {
    try {
      const notificaciones = await notificacionService.getLeidas(req.params.usuarioId);
      return res.status(200).json(notificaciones);
    } catch (error) {
      return next(error);
    }
  },

  async marcarComoLeida(req, res, next) {
    try {
      const notificacion = await notificacionService.marcarComoLeida(req.params.id);
      return res.status(200).json(notificacion);
    } catch (error) {
      return next(error);
    }
  },
};
