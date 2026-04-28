export class Especialidad {
  constructor({ id, nombre, duracionTurnoEnMins, costoConsulta }) {
    this.id = id;
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costoConsulta = costoConsulta;
  }

  static create({ id, nombre, duracionTurnoEnMins, costoConsulta }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id de la especialidad es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre de la especialidad es obligatorio');
    }
    if (!Number.isInteger(duracionTurnoEnMins) || duracionTurnoEnMins <= 0) {
      throw new Error('duracionTurnoEnMins debe ser un entero positivo');
    }
    if (typeof costoConsulta !== 'number' || costoConsulta <= 0) {
      throw new Error('costoConsulta debe ser un número positivo');
    }
    return new Especialidad({ id, nombre, duracionTurnoEnMins, costoConsulta });
  }
}
