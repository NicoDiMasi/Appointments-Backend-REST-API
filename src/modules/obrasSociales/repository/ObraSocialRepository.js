import { obraSocialModel } from '../schemas/ObraSocialSchema.js';
import { ObraSocial } from '../domain/ObraSocial.js';
import { Plan } from '../domain/Plan.js';
import { CoberturaEspecialidad } from '../domain/CoberturaEspecialidad.js';
import { CoberturaPractica } from '../domain/CoberturaPractica.js';

export class ObraSocialRepository {
    constructor() {
        this.model = obraSocialModel;
    }

    toDomain(doc) {
        const data = doc.toObject ? doc.toObject() : doc;
        return ObraSocial.create({
            id: data._id,
            nombre: data.nombre,
            planes: (data.planes ?? []).map(p => Plan.create({
                id: p.id,
                nombre: p.nombre,
                coberturasEspecialidad: (p.coberturasEspecialidad ?? []).map(c =>
                    CoberturaEspecialidad.create({ especialidad: c.especialidad, nivel: c.nivel })
                ),
                coberturasPractica: (p.coberturasPractica ?? []).map(c =>
                    CoberturaPractica.create({ practica: c.practica, nivel: c.nivel })
                ),
            })),
        });
    }

    _toDoc(obraSocial) {
        return {
            nombre: obraSocial.nombre,
            planes: obraSocial.planes.map(p => ({
                id: p.id,
                nombre: p.nombre,
                coberturasEspecialidad: p.coberturasEspecialidad.map(c => ({
                    especialidad: c.especialidad,
                    nivel: c.nivel,
                })),
                coberturasPractica: p.coberturasPractica.map(c => ({
                    practica: c.practica,
                    nivel: c.nivel,
                })),
            })),
        };
    }

    async findAll() {
        const docs = await this.model.find({});
        return docs.map(doc => this.toDomain(doc));
    }

    async findById(id) {
        const doc = await this.model.findById(id);
        return doc ? this.toDomain(doc) : null;
    }

    async findPlanById(obraSocialId, planId) {
        const obraSocial = await this.findById(obraSocialId);
        return obraSocial?.planes.find(p => p.id === planId) ?? null;
    }

    async save(obraSocial) {
        const doc = await this.model.findByIdAndUpdate(
            obraSocial.id,
            { $set: this._toDoc(obraSocial) },
            { upsert: true, new: true }
        );
        return this.toDomain(doc);
    }
}

export const obraSocialRepository = new ObraSocialRepository();