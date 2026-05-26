import { AppError } from '../../../errors/AppError.js';

export class NotificacionNotFoundError extends AppError {
  constructor(notificacionId) {
    super(`Notificacion con id '${notificacionId}' no encontrada`, 404);
  }
}

export class NotificacionInvalidaError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}
