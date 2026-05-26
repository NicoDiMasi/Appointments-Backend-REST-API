import { turnoModel } from '../schemas/TurnoSchema.js';
import { Turno } from '../domain/Turno.js';
import { CambioEstadoTurno } from '../domain/CambioEstadoTurno.js';

export class TurnoRepository {
    constructor() {
        this.model = turnoModel;
    }

    toDomain(doc) {
        const data = doc.toObject ? doc.toObject() : doc;

        return Turno.create({
            id: data._id,
            medico: data.medico,
            paciente: data.paciente,
            fechaHora: data.fechaHora,
            sede: data.sede,
            especialidad: data.especialidad,
            practica: data.practica,
            estado: data.estado,
            historialEstados: (data.historialEstados ?? []).map(h => new CambioEstadoTurno({
                fechaHoraIngreso: h.fechaHoraIngreso,
                estado: h.estado,
                turno: { id: h.turnoId },
                usuario: h.usuario,
                motivo: h.motivo,
            })),
            costo: data.costo,
            duracionTurno: data.duracionTurno,
            modulosRequeridos: data.modulosRequeridos,
        });
    }

    _toDoc(turno) {
        return {
            medico: turno.medico,
            paciente: turno.paciente,
            fechaHora: turno.fechaHora,
            sede: turno.sede,
            especialidad: turno.especialidad,
            practica: turno.practica,
            estado: turno.estado,
            historialEstados: (turno.historialEstados ?? []).map(h => ({
                fechaHoraIngreso: h.fechaHoraIngreso,
                estado: h.estado,
                turnoId: h.turno?.id ?? turno.id,
                usuario: h.usuario,
                motivo: h.motivo,
            })),
            costo: turno.costo,
            duracionTurno: turno.duracionTurno,
            modulosRequeridos: turno.modulosRequeridos,
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

    async findByMedicoId(medicoId) {
        const docs = await this.model.find({ 'medico.id': medicoId });
        return docs.map(doc => this.toDomain(doc));
    }

    async findByPacienteId(pacienteId) {
        const docs = await this.model.find({ 'paciente.id': pacienteId });
        return docs.map(doc => this.toDomain(doc));
    }

    async save(turno) {
        const doc = await this.model.findByIdAndUpdate(
            turno.id,
            { $set: this._toDoc(turno) },
            { upsert: true, new: true }
        );
        return this.toDomain(doc);
    }

    async deleteById(id) {
        await this.model.findByIdAndDelete(id);
    }
}

export const turnoRepository = new TurnoRepository();
