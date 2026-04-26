export class MedicoNotFoundError extends Error {
  constructor(medicoId) {
    super(`Médico con id '${medicoId}' no encontrado`);
    this.name = 'MedicoNotFoundError';
    this.statusCode = 404;
  }
}

export class DisponibilidadNotFoundError extends Error {
  constructor(diaSemana) {
    super(`No existe disponibilidad para el día '${diaSemana}'`);
    this.name = 'DisponibilidadNotFoundError';
    this.statusCode = 404;
  }
}

export class DisponibilidadInvalidaError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'DisponibilidadInvalidaError';
    this.statusCode = 400;
  }
}
