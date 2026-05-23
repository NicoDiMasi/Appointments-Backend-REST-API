import { Paciente } from '../domain/Paciente.js';
import { pacienteRepository } from '../repository/PacienteRepository.js';
import {
  PacienteInvalidoError,
  PacienteNotFoundError,
} from '../errors/PacienteErrors.js';

export class PacienteService {
  constructor(repository = pacienteRepository) {
    this.repository = repository;
  }

  findAll() {
    return this.repository.findAll();
  }

  findById(pacienteId) {
    const paciente = this.repository.findById(pacienteId);

    if (!paciente) {
      throw new PacienteNotFoundError(pacienteId);
    }

    return paciente;
  }

  crearPaciente(datosPaciente) {
    try {
      const paciente = Paciente.create(datosPaciente);
      return this.repository.save(paciente);
    } catch (error) {
      throw new PacienteInvalidoError(error.message);
    }
  }

  actualizarPaciente(pacienteId, cambios) {
    const paciente = this.findById(pacienteId);

    const datosActualizados = {
      ...paciente,
      ...cambios,
      id: paciente.id,
    };

    try {
      const pacienteActualizado = Paciente.create(datosActualizados);
      return this.repository.save(pacienteActualizado);
    } catch (error) {
      throw new PacienteInvalidoError(error.message);
    }
  }

  eliminarPaciente(pacienteId) {
    this.findById(pacienteId);
    this.repository.deleteById(pacienteId);
  }
}

export const pacienteService = new PacienteService();
