import { randomUUID } from 'crypto';
import { Notificacion } from '../domain/Notificacion.js';
import { notificacionRepository } from '../repository/NotificacionRepository.js';
import { NotificacionInvalidaError, NotificacionNotFoundError } from '../errors/NotificacionErrors.js';

export class NotificacionService {
  constructor(repository = notificacionRepository) {
    this.repository = repository;
  }

  async crearNotificacion({ destinatarioId, destinatarioTipo, remitenteId, remitenteTipo, mensaje, tipo }) {
    try {
      const id = randomUUID();
      const notificacion = Notificacion.create({ id, destinatarioId, destinatarioTipo, remitenteId, remitenteTipo, mensaje, tipo });
      return await this.repository.save(notificacion);
    } catch (error) {
      throw new NotificacionInvalidaError(error.message);
    }
  }

  async getNoLeidas(destinatarioId) {
    return await this.repository.findByDestinatarioAndLeida(destinatarioId, false);
  }

  async getLeidas(destinatarioId) {
    return await this.repository.findByDestinatarioAndLeida(destinatarioId, true);
  }

  async marcarComoLeida(notificacionId) {
    const notificacion = await this.repository.findById(notificacionId);
    if (!notificacion) throw new NotificacionNotFoundError(notificacionId);
    return await this.repository.updateById(notificacionId, { leida: true, fechaHoraLeida: new Date() });
  }
}

export const notificacionService = new NotificacionService();
