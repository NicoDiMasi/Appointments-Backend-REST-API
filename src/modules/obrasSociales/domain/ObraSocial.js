import { Plan } from './Plan.js';

export class ObraSocial {
  constructor({ id, nombre, planes }) {
    this.id = id;
    this.nombre = nombre;
    this.planes = planes;
  }

  static create({ id, nombre, planes = [] }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id de la obra social es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre de la obra social es obligatorio');
    }
    if (!Array.isArray(planes)) {
      throw new Error('planes debe ser una lista');
    }

    return new ObraSocial({
      id,
      nombre,
      planes: planes.map(plan => plan instanceof Plan ? plan : Plan.create(plan)),
    });
  }
}

