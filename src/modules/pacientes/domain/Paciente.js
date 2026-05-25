export class Paciente {
  constructor({ id, usuario, dni, nombre, obraSocial, plan }) {
    this.id = id;
    this.usuario = usuario;
    this.dni = dni;
    this.nombre = nombre;
    this.obraSocial = obraSocial;
    this.plan = plan;
    this.activo = true; //para eliminacion logica
  }

  static create({ id, usuario = null, dni, nombre,
    obraSocial = null, plan = null}) { //LOS DEJO COMO NULL PORQUE POR EL MOMENTO NO ES NECESARIO
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id del paciente es obligatorio');
    }
    if (!dni || typeof dni !== 'string' || dni.trim() === '') {
      throw new Error('El dni del paciente es obligatorio');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del paciente es obligatorio');
    }

    return new Paciente({
      id,
      usuario,
      dni,
      nombre,
      obraSocial,
      plan
    });
  }
}
