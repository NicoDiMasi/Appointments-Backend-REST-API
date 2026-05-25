import { Paciente } from '../domain/Paciente.js';
import { pacienteRepository } from '../repository/PacienteRepository.js';
import { TurnoService } from '../../turnos/service/TurnoService.js';
import { turnoRepository } from '../../turnos/repository/TurnoRepository.js';
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

    return await this.turnoService.reservarTurnoPaciente(paciente, datosTurno);
  }

  async cancelarTurno(pacienteId, turnoId, motivo) {
    const paciente = await this.findById(pacienteId);

    return await this.turnoService.cancelarTurnoPaciente(paciente, turnoId, motivo);
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
