import { AppError } from "../../../errors/AppError.js";


export class MedicoNotFoundError extends AppError {
  constructor(medicoId) {
    super(`Médico con id '${medicoId}' no encontrado`,404);
  }
}

export class DisponibilidadNotFoundError extends AppError {
  constructor(diaSemana) {
    super(`No existe disponibilidad para el día '${diaSemana}'`, 404);
  }
}

export class DisponibilidadInvalidaError extends AppError {
  constructor(mensaje) {
    super(mensaje, 400);
  }
}

export class ServicioNotFoundError extends AppError {
  constructor(tipo, servicioId) {
    super(`No existe servicio de tipo '${tipo}' con id '${servicioId}'`, 404);
  }
}

export class ServicioInvalidoError extends AppError {
  constructor(mensaje) {
    super(mensaje, 400);
  }
}
