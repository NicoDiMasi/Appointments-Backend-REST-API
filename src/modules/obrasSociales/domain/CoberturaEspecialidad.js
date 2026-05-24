import { NivelCobertura } from './NivelCobertura.js';

const NIVELES_VALIDOS = Object.values(NivelCobertura);

export class CoberturaEspecialidad {
  constructor({ especialidad, nivel }) {
    this.especialidad = especialidad;
    this.nivel = nivel;
  }

  static create({ especialidad, nivel }) {
    if (!especialidad) {
      throw new Error('La especialidad de la cobertura es obligatoria');
    }
    if (!nivel || !NIVELES_VALIDOS.includes(nivel)) {
      throw new Error(`nivel invalido. Valores permitidos: ${NIVELES_VALIDOS.join(', ')}`);
    }

    return new CoberturaEspecialidad({ especialidad, nivel });
  }
}

