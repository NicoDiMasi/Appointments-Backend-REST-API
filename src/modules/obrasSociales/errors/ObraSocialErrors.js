import { AppError } from '../../../errors/AppError.js';

export class ObraSocialNotFoundError extends AppError {
  constructor(obraSocialId) {
    super(`Obra social con id '${obraSocialId}' no encontrada`, 404);
  }
}

export class PlanNotFoundError extends AppError {
  constructor(planId) {
    super(`Plan con id '${planId}' no encontrado`, 404);
  }
}

