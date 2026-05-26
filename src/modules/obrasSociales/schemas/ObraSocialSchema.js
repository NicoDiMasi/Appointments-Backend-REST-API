import mongoose from 'mongoose';
import { NivelCobertura } from '../domain/NivelCobertura.js';

const coberturaEspecialidadSchema = new mongoose.Schema({
    especialidad: { type: Object, required: true },
    nivel: { type: String, required: true, enum: Object.values(NivelCobertura) },
}, { _id: false });

const coberturaPracticaSchema = new mongoose.Schema({
    practica: { type: Object, required: true },
    nivel: { type: String, required: true, enum: Object.values(NivelCobertura) },
}, { _id: false });

const planSchema = new mongoose.Schema({
    id: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    coberturasEspecialidad: { type: [coberturaEspecialidadSchema], default: [] },
    coberturasPractica: { type: [coberturaPracticaSchema], default: [] },
}, { _id: false });

const obraSocialSchema = new mongoose.Schema({
    _id: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    planes: { type: [planSchema], default: [] },
}, { timestamps: true, versionKey: false, collection: 'obrasSociales' });

export const obraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);