export class TurnoNotFoundError extends Error {
  constructor(turnoId) {
    super(`Turno con id '${turnoId}' no encontrado`);
    this.name = 'TurnoNotFoundError';
    this.statusCode = 404;
  }
}

export class TurnoNoDisponibleError extends Error {
  constructor() {
    super('El médico no tiene disponibilidad para la fecha y horario solicitados');
    this.name = 'TurnoNoDisponibleError';
    this.statusCode = 400;
  }
}

export class TurnoOcupadoError extends Error {
  constructor() {
    super('Ya existe un turno asignado para ese médico en la fecha y horario solicitados');
    this.name = 'TurnoOcupadoError';
    this.statusCode = 409;
  }
}

export class TurnoInvalidoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TurnoInvalidoError';
    this.statusCode = 400;
  }
}