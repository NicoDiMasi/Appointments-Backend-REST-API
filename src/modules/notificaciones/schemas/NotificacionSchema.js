import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  _id: { type: String, required: true, trim: true },
  destinatarioId: { type: String, required: true, trim: true },
  destinatarioTipo: { type: String, required: true, trim: true },
  remitenteId: { type: String, required: true, trim: true },
  remitenteTipo: { type: String, required: true, trim: true },
  mensaje: { type: String, required: true },
  tipo: { type: String, required: true, trim: true },
  fechaHoraCreacion: { type: Date, default: Date.now },
  fechaHoraLeida: { type: Date, default: null },
  leida: { type: Boolean, default: false },
}, {
  timestamps: false,
  versionKey: false,
  collection: 'notificaciones',
  bufferCommands: false,
});

export const notificacionModel = mongoose.model('Notificacion', notificacionSchema);
