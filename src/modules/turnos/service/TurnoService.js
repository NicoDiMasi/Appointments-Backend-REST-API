import { Turno } from '../domain/Turno.js';
import { Agenda } from '../domain/Agenda.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';
import { TurnoRepository } from '../repository/TurnoRepository.js';
import {
    calcularCantidadModulos,
    calcularDuracionModular,
} from '../domain/ModuloTurno.js';
import {
    TurnoNotFoundError,
    TurnoNoDisponibleError,
    TurnoBajaFueraDeTiempoError,
    TurnoInvalidoError,
} from '../errors/TurnoErrors.js';


function faltaMasDeUnaHora(fechaHoraTurno) { //Para la cancelación del turno
    const ahora = new Date();
    const unaHoraEnMs = 60 * 60 * 1000;

    return fechaHoraTurno.getTime() - ahora.getTime() >= unaHoraEnMs;
}
export class TurnoService {

    constructor(turnoRepository) {
        this.turnoRepository = turnoRepository; 
        this.agenda = new Agenda();
    }

    findAll() {
      return this.turnoRepository.findAll();
    }
    
    findById(turnoId) {
      const turno = this.turnoRepository.findById(turnoId);
    
      if (!turno) {
        throw new TurnoNotFoundError(turnoId);
      }
  
      return turno;
    }

    crearTurno(datosTurno) {
        const turnoNuevo = Turno.create(datosTurno);

        const turnosDelMedico = this.turnoRepository.findByMedicoId(
            turnoNuevo.medico.id
        );


        const estaDisponible = this.agenda.estaDisponible(turnoNuevo,turnosDelMedico);

        if (!estaDisponible) {
            throw new Error("El médico no está disponible en ese horario");
        }

        return this.turnoRepository.save(turnoNuevo);
    };

    actualizarTurno(turnoId, cambios) {
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) throw new TurnoNotFoundError(turnoId);

        if (cambios.fechaHora !== undefined) {
            const nuevaFechaHora = new Date(cambios.fechaHora);

            if (Number.isNaN(nuevaFechaHora.getTime())) {
                throw new TurnoInvalidoError('La fecha y hora del turno no es válida');
            }

            const turnoActualizadoTemporal = Turno.create({
                id: turno.id,
                medico: turno.medico,
                paciente: turno.paciente,
                fechaHora: nuevaFechaHora,
                sede: cambios.sede ?? turno.sede,
                especialidad: cambios.especialidad ?? turno.especialidad,
                practica: cambios.practica ?? turno.practica,
                estado: turno.estado,
                historialEstados: turno.historialEstados,
                costo: cambios.costo ?? turno.costo,
            });

            const turnosDelMedico = this.turnoRepository
                .findByMedicoId(turno.medico.id)
                .filter(t => t.id !== turno.id);

            const estaDisponible = this.agenda.estaDisponible(turnoActualizadoTemporal,turnosDelMedico);

            if (!estaDisponible) {
                throw new TurnoNoDisponibleError();
            }

            turno.fechaHora = nuevaFechaHora;
        }

        if (cambios.sede !== undefined) {
            turno.sede = cambios.sede;
        }

        if (cambios.especialidad !== undefined) {
            turno.especialidad = cambios.especialidad;
            turno.modulosRequeridos = calcularCantidadModulos(cambios.especialidad.duracionTurnoEnMins);
            turno.duracionTurno = calcularDuracionModular(cambios.especialidad.duracionTurnoEnMins);
        }

        if (cambios.costo !== undefined) {
            if (typeof cambios.costo !== 'number' || cambios.costo < 0) {
                throw new TurnoInvalidoError('El costo debe ser un número mayor o igual a cero');
            }

            turno.costo = cambios.costo;
        }

        return this.turnoRepository.save(turno);
    }

    darDeBajaTurno(turnoId, usuario, motivo) { //Dar de baja, no es DELETE, es actualizar estado
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) {
            throw new TurnoNotFoundError(turnoId);
        }

        if (!faltaMasDeUnaHora(turno.fechaHora)) {
            throw new TurnoBajaFueraDeTiempoError();
        }

        turno.actualizarEstado(
            EstadoTurno.CANCELADO,
            usuario,
            motivo
        );

        return this.turnoRepository.save(turno);
    }

    eliminarTurno(turnoId) {
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) {
            throw new TurnoNotFoundError(turnoId);
        }

        if (!faltaMasDeUnaHora(turno.fechaHora)) { //Por las dudas le dejo la misma restricción que para dar de baja
            throw new TurnoBajaFueraDeTiempoError();
        }

        this.turnoRepository.deleteById(turnoId);
    }
}
