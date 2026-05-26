import mongoose from 'mongoose';
import { Turno } from '../domain/Turno.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';

const cambioEstadoSchema = new mongoose.Schema({
    fechaHoraIngreso: { type: Date, required: true },
    estado: { type: String, required: true, enum: Object.values(EstadoTurno) },
    turnoId: { type: String, required: true },
    usuario: { type: Object, required: true },
    motivo: { type: String, default: '' },
}, { _id: false });

const turnoSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    medico: { type: Object, required: true },
    paciente: { type: Object, default: null },
    fechaHora: { type: Date, required: true },
    sede: { type: Object, default: null },
    especialidad: { type: Object, default: null },
    practica: { type: Object, default: null },
    estado: { type: String, required: true, enum: Object.values(EstadoTurno) },
    historialEstados: { type: [cambioEstadoSchema], default: [] },
    costo: { type: Number, required: true }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'turnos'
});

turnoSchema.loadClass(Turno);

export const turnoModel = mongoose.model('Turno', turnoSchema);
