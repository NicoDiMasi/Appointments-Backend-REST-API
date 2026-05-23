import { AppError } from "../../../errors/AppError.js";



export class TurnoNotFoundError extends AppError {
  constructor(turnoId) {
    super(`Turno con id '${turnoId}' no encontrado`, 404);
  }
}

export class TurnoNoDisponibleError extends AppError {
  constructor(details = null) {
    super('El médico no tiene disponibilidad para la fecha y horario solicitados',400, details);
  }
}

export class TurnoOcupadoError extends AppError {
  constructor() {
    super('Ya existe un turno asignado para ese médico en la fecha y horario solicitados',409);
  }
}

export class TurnoInvalidoError extends AppError {
  constructor(message) {
    super(message,400);
  }
}

export class TurnoBajaFueraDeTiempoError extends AppError {
  constructor() {
    super('El turno solo puede darse de baja hasta una hora antes del horario del mismo',400);
  }
}
