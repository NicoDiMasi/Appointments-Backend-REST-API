export class Sede {
  constructor({ id, nombre, direccion }) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
  }

  static create({ id, nombre, direccion }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id de la sede es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre de la sede es obligatorio');
    }
    if (!direccion || typeof direccion !== 'string' || direccion.trim() === '') {
      throw new Error('La direccion de la sede es obligatoria');
    }

    return new Sede({ id, nombre, direccion });
  }
}

