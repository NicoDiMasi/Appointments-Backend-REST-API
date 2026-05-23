import { Turno } from '../domain/Turno.js';
import { Agenda } from '../domain/Agenda.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';
import { TurnoRepository } from '../repository/TurnoRepository.js';
import { medicoRepository } from '../../medicos/repository/MedicoRepository.js';
import { MedicoNotFoundError } from '../../medicos/errors/MedicoErrors.js';
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

    constructor(turnoRepository, medicosRepository = medicoRepository) {
        this.turnoRepository = turnoRepository; 
        this.medicoRepository = medicosRepository;
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
        const medico = this.medicoRepository.findById(datosTurno.medico?.id);

        if (!medico) {
            throw new MedicoNotFoundError(datosTurno.medico?.id);
        }

        const turnoNuevo = Turno.create({
            ...datosTurno,
            medico,
        });

        const turnosDelMedico = this.turnoRepository.findByMedicoId(
            turnoNuevo.medico.id
        );


        const estaDisponible = this.agenda.estaDisponible(turnoNuevo,turnosDelMedico);

        if (!estaDisponible) {
            throw new TurnoNoDisponibleError();
        }

        return this.turnoRepository.save(turnoNuevo);
    };

    consultarDisponibilidad({ medicoId, fechaHora, duracionTurnoEnMins, especialidadId, ventanaMinutos = 60 }) {
        const medico = this.medicoRepository.findById(medicoId);

        if (!medico) {
            throw new MedicoNotFoundError(medicoId);
        }

        const fechaHoraSolicitada = new Date(fechaHora);

        if (Number.isNaN(fechaHoraSolicitada.getTime())) {
            throw new TurnoInvalidoError('La fecha y hora del turno no es válida');
        }

        const especialidad = especialidadId
            ? medico.especialidades.find(e => e.id === especialidadId)
            : null;

        if (especialidadId && !especialidad) {
            throw new TurnoInvalidoError(`El médico no atiende la especialidad '${especialidadId}'`);
        }

        const duracionPrestacion = especialidad?.duracionTurnoEnMins ?? Number(duracionTurnoEnMins);

        if (!Number.isInteger(duracionPrestacion) || duracionPrestacion <= 0) {
            throw new TurnoInvalidoError('La duración del turno debe ser un entero positivo');
        }

        const prestacion = especialidad ?? {
            id: 'prestacion-consultada',
            nombre: 'Prestación consultada',
            duracionTurnoEnMins: duracionPrestacion,
        };

        const turnoSolicitado = Turno.create({
            id: 'turno-consultado',
            medico,
            paciente: null,
            fechaHora: fechaHoraSolicitada,
            sede: null,
            especialidad: prestacion,
            estado: EstadoTurno.DISPONIBLE,
            historialEstados: [],
            costo: 0,
        });

        const ventana = Number(ventanaMinutos);

        if (!Number.isInteger(ventana) || ventana <= 0) {
            throw new TurnoInvalidoError('La ventana de búsqueda debe ser un entero positivo');
        }

        const turnosDelMedico = this.turnoRepository.findByMedicoId(medicoId);
        const disponible = this.agenda.estaDisponible(turnoSolicitado, turnosDelMedico);

        return {
            disponible,
            medicoId,
            fechaHora: fechaHoraSolicitada.toISOString(),
            duracionPrestacion,
            duracionTurno: turnoSolicitado.duracionTurno,
            modulosRequeridos: turnoSolicitado.modulosRequeridos,
            turnosCercanos: this.buscarTurnosCercanos(
                turnoSolicitado,
                turnosDelMedico,
                ventana
            ),
        };
    }

    buscarTurnosCercanos(turnoSolicitado, turnosDelMedico, ventanaMinutos) {
        const ventanaEnMs = ventanaMinutos * 60 * 1000;
        const inicioSolicitado = turnoSolicitado.fechaHora.getTime();

        return turnosDelMedico
            .filter(turno => turno.fechaHora.toDateString() === turnoSolicitado.fechaHora.toDateString())
            .filter(turno => {
                const diferencia = Math.abs(turno.fechaHora.getTime() - inicioSolicitado);

                return diferencia <= ventanaEnMs || this.agenda.seSuperponen(turnoSolicitado, turno);
            })
            .map(turno => ({
                id: turno.id,
                estado: turno.estado,
                fechaHora: turno.fechaHora.toISOString(),
                duracionTurno: turno.duracionTurno,
                seSuperpone: this.agenda.seSuperponen(turnoSolicitado, turno),
            }));
    }

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
