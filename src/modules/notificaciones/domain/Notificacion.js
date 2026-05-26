import { TipoNotificacion } from './TipoNotificacion.js';

const TIPOS_VALIDOS = Object.values(TipoNotificacion);
const TIPOS_DESTINATARIO_VALIDOS = ['paciente', 'medico'];

export class Notificacion {
  constructor({ id, destinatarioId, destinatarioTipo, remitenteId, remitenteTipo, mensaje, tipo, fechaHoraCreacion, fechaHoraLeida, leida }) {
    this.id = id;
    this.destinatarioId = destinatarioId;
    this.destinatarioTipo = destinatarioTipo;
    this.remitenteId = remitenteId;
    this.remitenteTipo = remitenteTipo;
    this.mensaje = mensaje;
    this.tipo = tipo;
    this.fechaHoraCreacion = fechaHoraCreacion ?? new Date();
    this.fechaHoraLeida = fechaHoraLeida ?? null;
    this.leida = leida ?? false;
  }

  static create({ id, destinatarioId, destinatarioTipo, remitenteId, remitenteTipo, mensaje, tipo, fechaHoraCreacion = new Date(), fechaHoraLeida = null, leida = false }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id de la notificacion es obligatorio');
    }
    if (!destinatarioId || typeof destinatarioId !== 'string' || destinatarioId.trim() === '') {
      throw new Error('destinatarioId es obligatorio');
    }
    if (!TIPOS_DESTINATARIO_VALIDOS.includes(destinatarioTipo)) {
      throw new Error("destinatarioTipo debe ser 'paciente' o 'medico'");
    }
    if (!remitenteId || typeof remitenteId !== 'string' || remitenteId.trim() === '') {
      throw new Error('remitenteId es obligatorio');
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
    }
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim() === '') {
      throw new Error('El mensaje es obligatorio');
    }
    return new Notificacion({ id, destinatarioId, destinatarioTipo, remitenteId, remitenteTipo, mensaje, tipo, fechaHoraCreacion, fechaHoraLeida, leida });
  }
}
