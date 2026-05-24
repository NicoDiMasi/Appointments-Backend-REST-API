export class Practica {
  constructor({ id, codigo, nombre, duracionTurnoEnMins, costo }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costo = costo;
  }

  static create({ id, codigo, nombre, duracionTurnoEnMins, costo }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id de la práctica es obligatorio');
    }
    if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
      throw new Error('El código de la práctica es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre de la práctica es obligatorio');
    }
    if (!Number.isInteger(duracionTurnoEnMins) || duracionTurnoEnMins <= 0) {
      throw new Error('duracionTurnoEnMins debe ser un entero positivo');
    }
    if (typeof costo !== 'number' || costo < 0) {
      throw new Error('costo debe ser un número mayor o igual a cero');
    }

    return new Practica({ id, codigo, nombre, duracionTurnoEnMins, costo });
  }
}
