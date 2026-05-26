import mongoose from 'mongoose';
import { Medico } from '../domain/Medico.js';

const disponibilidadSchema = new mongoose.Schema({
    diaSemana: { type: String, required: true, trim: true },
    horaDesde:  { type: String, required: true, trim: true },
    horaHasta:  { type: String, required: true, trim: true },
}, { _id: false });

const especialidadSchema = new mongoose.Schema({
    id: {type: String, required: true, trim: true},
    nombre: { type: String, required: true, trim: true },
    duracionTurnoEnMins: { type: Number, required: true },
    costoConsulta: { type: Number, required: true },
}, { _id: false });

const practicaSchema = new mongoose.Schema({
    id: {type: String, required: true, trim: true},
    codigo: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    duracionTurnoEnMins: { type: Number, required: true },
    costo: { type: Number, required: true },
}, { _id: false });

const sedeSchema = new mongoose.Schema({
    id: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    direccion: { type: String, required: true, trim: true },
}, { _id: false });

const medicoSchema = new mongoose.Schema({
    //aca dejo _id pero no voy a usar la referencia de Mongo, sino que en el repository lo mapeo al id del dominio
    _id: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    especialidades: { type: [especialidadSchema], default: [] },
    practicas: { type: [practicaSchema], default: [] },
    disponibilidades: { type: [disponibilidadSchema], default: [] },
    sedes: { type: [sedeSchema], default: [] },
}, {
    timestamps: true,
    versionKey: false,
    collection: 'medicos'
});

medicoSchema.loadClass(Medico);

export const medicoModel = mongoose.model('Medico', medicoSchema);
