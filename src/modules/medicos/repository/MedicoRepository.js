import { medicoModel } from '../schemas/MedicoSchema.js';
import { Medico } from '../domain/Medico.js';
import { Especialidad } from '../domain/Especialidad.js';
import { Practica } from '../domain/Practica.js';
import { DisponibilidadHoraria } from '../domain/DisponibilidadHoraria.js';
import { Sede } from '../domain/Sede.js';

class MedicoRepository {
    constructor() {
        this.model = medicoModel;
    }

    toDomain(doc) {
        const data = doc.toObject ? doc.toObject() : doc;
        return new Medico({
            id: data._id,
            matricula: data.matricula,
            nombre: data.nombre,
            especialidades: (data.especialidades ?? []).map(e => new Especialidad(e)),
            practicas: (data.practicas ?? []).map(p => new Practica(p)),
            disponibilidades: (data.disponibilidades ?? []).map(d => new DisponibilidadHoraria(d)),
            sedes: (data.sedes ?? []).map(s => new Sede(s)),
        });
    }

    async findAll() {
        const docs = await this.model.find({});
        return docs.map(doc => this.toDomain(doc));
    }

    async findById(id) {
        const doc = await this.model.findById(id);
        return doc ? this.toDomain(doc) : null;
    }

    
    async save(medico) {
        const doc = new this.model({ _id: medico.id, ...medico });
        const saved = await doc.save();
        return this.toDomain(saved);
    }

    async updateById(id, datosActualizados) {
        const doc = await this.model.findByIdAndUpdate(
            id,
            { $set: datosActualizados },
            { new: true }
        );
        return doc ? this.toDomain(doc) : null;
    }
}

export const medicoRepository = new MedicoRepository();