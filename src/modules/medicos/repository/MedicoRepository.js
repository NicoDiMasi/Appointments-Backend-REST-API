import { Medico } from '../domain/Medico.js';
import { Especialidad } from '../domain/Especialidad.js';
import { DisponibilidadHoraria } from '../domain/DisponibilidadHoraria.js';

class MedicoRepository {
  constructor() {
    if (MedicoRepository._instance) {
      return MedicoRepository._instance;
    }
    MedicoRepository._instance = this;
    this._medicos = this._initMockData();
  }

  _initMockData() {
    const cardiologia = Especialidad.create({
      id: 'esp-001', nombre: 'Cardiología', duracionTurnoEnMins: 30, costoConsulta: 5000,
    });
    const neurologia = Especialidad.create({
      id: 'esp-002', nombre: 'Neurología', duracionTurnoEnMins: 45, costoConsulta: 7000,
    });
    const pediatria = Especialidad.create({
      id: 'esp-003', nombre: 'Pediatría', duracionTurnoEnMins: 20, costoConsulta: 4000,
    });
    const clinicaMedica = Especialidad.create({
      id: 'esp-004', nombre: 'Clínica Médica', duracionTurnoEnMins: 30, costoConsulta: 3500,
    });

    const medico1 = Medico.create({
      id: 'med-001', matricula: 'MP-1234', nombre: 'Ana Gómez',
      especialidades: [cardiologia, clinicaMedica],
    });
    medico1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' }));
    medico1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MIERCOLES', horaDesde: '14:00', horaHasta: '18:00' }));
    medico1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'VIERNES', horaDesde: '09:00', horaHasta: '13:00' }));

    const medico2 = Medico.create({
      id: 'med-002', matricula: 'MP-5678', nombre: 'Carlos Pérez',
      especialidades: [neurologia],
    });
    medico2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MARTES', horaDesde: '07:00', horaHasta: '11:00' }));
    medico2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'JUEVES', horaDesde: '15:00', horaHasta: '19:00' }));
    medico2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'SABADO', horaDesde: '08:00', horaHasta: '12:00' }));

    const medico3 = Medico.create({
      id: 'med-003', matricula: 'MP-9012', nombre: 'Laura Martínez',
      especialidades: [pediatria],
    });
    medico3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '10:00', horaHasta: '14:00' }));
    medico3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MIERCOLES', horaDesde: '16:00', horaHasta: '20:00' }));
    medico3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'VIERNES', horaDesde: '08:30', horaHasta: '12:30' }));

    return [medico1, medico2, medico3];
  }

  findAll() {
    return this._medicos;
  }

  findById(id) {
    return this._medicos.find(m => m.id === id) ?? null;
  }

  save(medico) {
    const index = this._medicos.findIndex(m => m.id === medico.id);
    if (index !== -1) {
      this._medicos[index] = medico;
    } else {
      this._medicos.push(medico);
    }
    return medico;
  }
}

export const medicoRepository = new MedicoRepository();
