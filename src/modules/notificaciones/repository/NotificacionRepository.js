import { notificacionModel } from '../schemas/NotificacionSchema.js';

class NotificacionRepository {
  constructor() {
    this.model = notificacionModel;
  }

  async save(notificacion) {
    const nueva = new this.model({ _id: notificacion.id, ...notificacion });
    return await nueva.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async updateById(id, datos) {
    return await this.model.findByIdAndUpdate(id, datos, { new: true });
  }

  async findByDestinatarioAndLeida(destinatarioId, leida) {
    return await this.model.find({ destinatarioId, leida });
  }
}

export const notificacionRepository = new NotificacionRepository();
export { NotificacionRepository };
