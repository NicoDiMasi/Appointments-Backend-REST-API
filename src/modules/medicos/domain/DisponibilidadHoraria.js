import { DiaSemana } from './DiaSemana.js';
import { DisponibilidadInvalidaError } from '../errors/MedicoErrors.js';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DIAS_VALIDOS = Object.values(DiaSemana);

export class DisponibilidadHoraria {
  constructor({ diaSemana, horaDesde, horaHasta }) {
    this.diaSemana = diaSemana;
    this.horaDesde = horaDesde;
    this.horaHasta = horaHasta;
  }

  static create({ diaSemana, horaDesde, horaHasta }) {
    if (!diaSemana || !DIAS_VALIDOS.includes(diaSemana)) {
      throw new DisponibilidadInvalidaError(
        `diaSemana inválido. Valores permitidos: ${DIAS_VALIDOS.join(', ')}`
      );
    }
    if (!horaDesde || !HORA_REGEX.test(horaDesde)) {
      throw new DisponibilidadInvalidaError('horaDesde tiene formato inválido. Use HH:MM');
    }
    if (!horaHasta || !HORA_REGEX.test(horaHasta)) {
      throw new DisponibilidadInvalidaError('horaHasta tiene formato inválido. Use HH:MM');
    }
    return new DisponibilidadHoraria({ diaSemana, horaDesde, horaHasta });
  }
}
