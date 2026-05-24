import { DisponibilidadHoraria } from './DisponibilidadHoraria.js';
import { DisponibilidadInvalidaError } from '../errors/MedicoErrors.js';

export class Medico {
  constructor({ id, matricula, nombre, especialidades, practicas, disponibilidades, sedes }) {
    this.id = id;
    this.matricula = matricula;
    this.nombre = nombre;
    this.especialidades = especialidades ?? [];
    this.practicas = practicas ?? [];
    this.disponibilidades = disponibilidades ?? [];
    this.sedes = sedes ?? [];
  }

  definirDisponibilidad(disponibilidad) {
    if (!(disponibilidad instanceof DisponibilidadHoraria)) {
      throw new DisponibilidadInvalidaError('Se esperaba una instancia de DisponibilidadHoraria');
    }
    const yaExiste = this.disponibilidades.some(d => d.diaSemana === disponibilidad.diaSemana);
    if (yaExiste) {
      throw new DisponibilidadInvalidaError(
        `Ya existe una disponibilidad para el día ${disponibilidad.diaSemana}`
      );
    }
    this.disponibilidades.push(disponibilidad);
  }

  static create({ id, matricula, nombre, especialidades, practicas, disponibilidades, sedes }) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('El id del médico es obligatorio');
    }
    if (!matricula || typeof matricula !== 'string' || matricula.trim() === '') {
      throw new Error('La matrícula del médico es obligatoria');
    }
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del médico es obligatorio');
    }
    return new Medico({
      id,
      matricula,
      nombre,
      especialidades: especialidades ?? [],
      practicas: practicas ?? [],
      disponibilidades: disponibilidades ?? [],
      sedes: sedes ?? [],
    });
  }
}
