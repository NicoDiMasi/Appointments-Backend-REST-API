import { AppError } from '../../../errors/AppError.js';

export class PacienteNotFoundError extends AppError {
  constructor(pacienteId) {
    super(`Paciente con id '${pacienteId}' no encontrado`, 404);
  }
}

export class PacienteInvalidoError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}
