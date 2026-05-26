import { Paciente } from '../domain/Paciente.js';
import { pacienteRepository } from '../repository/PacienteRepository.js';
import { TurnoService } from '../../turnos/service/TurnoService.js';
import { turnoRepository } from '../../turnos/repository/TurnoRepository.js';
import { notificacionService } from '../../notificaciones/service/NotificacionService.js';
import { TipoNotificacion } from '../../notificaciones/domain/TipoNotificacion.js';
import {
  PacienteInvalidoError,
  PacienteNotFoundError,
} from '../errors/PacienteErrors.js';

export class PacienteService {
  constructor(repository = pacienteRepository, turnoService = new TurnoService(turnoRepository)) {
    this.repository = repository;
    this.turnoService = turnoService;
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(pacienteId) {
    const paciente = await this.repository.findById(pacienteId);

    if (!paciente) {
      throw new PacienteNotFoundError(pacienteId);
    }

    return paciente;
  }

   async crearPaciente(datosPaciente) {
    try {
      const paciente = Paciente.create(datosPaciente);
      return await this.repository.save(paciente);
    } catch (error) {
      throw new PacienteInvalidoError(error.message);
    }
  }

  async actualizarPaciente(pacienteId, cambios) {
    const paciente = await this.findById(pacienteId);

    const datosActualizados = {
      ...paciente,
      ...cambios,
      id: paciente.id,
    };

    try {
      //puede sonar redundante pero Paciente.create sirve como validador.
      const pacienteActualizado = Paciente.create(datosActualizados);
      const {id, ...datos} = pacienteActualizado;
      return await this.repository.updateById(id, datos);
    } catch (error) {
      throw new PacienteInvalidoError(error.message);
    }
  }

  async eliminarPaciente(pacienteId) {
    await this.findById(pacienteId);
    await this.repository.deleteById(pacienteId);
  }

  async reservarTurno(pacienteId, datosTurno) {
    const paciente = await this.findById(pacienteId);
    const turno = await this.turnoService.reservarTurnoPaciente(paciente, datosTurno);

    notificacionService.crearNotificacion({
      destinatarioId: turno.medico.id,
      destinatarioTipo: 'medico',
      remitenteId: paciente.id,
      remitenteTipo: 'paciente',
      mensaje: `El paciente ${paciente.nombre} reservo un turno de ${turno.especialidad?.nombre ?? turno.practica?.nombre ?? 'servicio'}.`,
      tipo: TipoNotificacion.RESERVA_TURNO,
    }).catch(err => console.error('Error al crear notificacion RESERVA_TURNO:', err));

    return turno;
  }

  async cancelarTurno(pacienteId, turnoId, motivo) {
    const paciente = await this.findById(pacienteId);
    const turno = await this.turnoService.cancelarTurnoPaciente(paciente, turnoId, motivo);

    notificacionService.crearNotificacion({
      destinatarioId: turno.medico.id,
      destinatarioTipo: 'medico',
      remitenteId: paciente.id,
      remitenteTipo: 'paciente',
      mensaje: `El paciente ${paciente.nombre} cancelo el turno. Motivo: ${motivo}`,
      tipo: TipoNotificacion.CANCELACION_PACIENTE,
    }).catch(err => console.error('Error al crear notificacion CANCELACION_PACIENTE:', err));

    return turno;
  }

  async consultarHistorialTurnos(pacienteId) {
    await this.findById(pacienteId);

    return await this.turnoService.findByPacienteId(pacienteId);
  }

  async cambiarTurno(pacienteId, turnoId, cambios) {
    const paciente = await this.findById(pacienteId);

    return await this.turnoService.cambiarTurnoPaciente(paciente, turnoId, cambios);
  }
}

export const pacienteService = new PacienteService();
