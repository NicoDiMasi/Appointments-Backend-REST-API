import { CoberturaEspecialidad } from './CoberturaEspecialidad.js';
import { CoberturaPractica } from './CoberturaPractica.js';

export class Plan {
  constructor({ id, nombre, coberturasEspecialidad, coberturasPractica }) {
    this.id = id;
    this.nombre = nombre;
    this.coberturasEspecialidad = coberturasEspecialidad;
    this.coberturasPractica = coberturasPractica;
  }

  static create({ id, nombre, coberturasEspecialidad = [], coberturasPractica = [] }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id del plan es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del plan es obligatorio');
    }
    if (!Array.isArray(coberturasEspecialidad)) {
      throw new Error('coberturasEspecialidad debe ser una lista');
    }
    if (!Array.isArray(coberturasPractica)) {
      throw new Error('coberturasPractica debe ser una lista');
    }

    return new Plan({
      id,
      nombre,
      coberturasEspecialidad: coberturasEspecialidad.map(cobertura =>
        cobertura instanceof CoberturaEspecialidad
          ? cobertura
          : CoberturaEspecialidad.create(cobertura)
      ),
      coberturasPractica: coberturasPractica.map(cobertura =>
        cobertura instanceof CoberturaPractica
          ? cobertura
          : CoberturaPractica.create(cobertura)
      ),
    });
  }
}

