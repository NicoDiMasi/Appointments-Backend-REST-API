import { NivelCobertura } from './NivelCobertura.js';

const NIVELES_VALIDOS = Object.values(NivelCobertura);

export class CoberturaPractica {
  constructor({ practica, nivel }) {
    this.practica = practica;
    this.nivel = nivel;
  }

  static create({ practica, nivel }) {
    if (!practica) {
      throw new Error('La practica de la cobertura es obligatoria');
    }
    if (!nivel || !NIVELES_VALIDOS.includes(nivel)) {
      throw new Error(`nivel invalido. Valores permitidos: ${NIVELES_VALIDOS.join(', ')}`);
    }

    return new CoberturaPractica({ practica, nivel });
  }
}

