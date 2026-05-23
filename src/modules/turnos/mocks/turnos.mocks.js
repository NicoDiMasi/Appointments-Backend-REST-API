import { Turno } from '../domain/Turno.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';

import { DiaSemana } from '../../medicos/domain/DiaSemana.js';
import { Medico } from '../../medicos/domain/Medico.js';
import { Especialidad } from '../../medicos/domain/Especialidad.js';
import { DisponibilidadHoraria } from '../../medicos/domain/DisponibilidadHoraria.js';

function numeroDiaSemana(diaSemana) {
  const dias = {
    DOMINGO: 0,
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6,
  };

  return dias[diaSemana];
}

export function crearFechaProxima(diaSemana, hora) {
  const fecha = new Date();
  const diaObjetivo = numeroDiaSemana(diaSemana);

  const diferenciaDias = (diaObjetivo - fecha.getDay() + 7) % 7 || 7;

  fecha.setDate(fecha.getDate() + diferenciaDias);

  const [horas, minutos] = hora.split(':').map(Number);
  fecha.setHours(horas, minutos, 0, 0);

  return fecha;
}

export const usuarioAdminMock = {
  id: 'usr-001',
  nombre: 'Admin Mock',
};

export const sedeCentralMock = {
  id: 'sede-001',
  nombre: 'Sede Central',
  direccion: 'Av. Siempre Viva 123',
};

export const especialidadCardiologiaMock = Especialidad.create({
  id: 'esp-001',
  nombre: 'Cardiología',
  duracionTurnoEnMins: 30,
  costoConsulta: 10000,
});

export const especialidadClinicaMock = Especialidad.create({
  id: 'esp-002',
  nombre: 'Clínica Médica',
  duracionTurnoEnMins: 30,
  costoConsulta: 8000,
});

export const medicoCardiologoMock = Medico.create({
  id: 'med-001',
  matricula: 'MP-1234',
  nombre: 'Dr. House',
  especialidades: [especialidadCardiologiaMock],
});

medicoCardiologoMock.definirDisponibilidad(
  DisponibilidadHoraria.create({
    diaSemana: DiaSemana.LUNES,
    horaDesde: '08:00',
    horaHasta: '12:00',
  })
);

medicoCardiologoMock.definirDisponibilidad(
  DisponibilidadHoraria.create({
    diaSemana: DiaSemana.MIERCOLES,
    horaDesde: '08:00',
    horaHasta: '12:00',
  })
);

export const otroMedicoMock = Medico.create({
  id: 'med-002',
  matricula: 'MP-5678',
  nombre: 'Dra. Grey',
  especialidades: [especialidadCardiologiaMock],
});

otroMedicoMock.definirDisponibilidad(
  DisponibilidadHoraria.create({
    diaSemana: DiaSemana.LUNES,
    horaDesde: '08:00',
    horaHasta: '12:00',
  })
);

export function crearDatosTurnoMock(overrides = {}) {
  return {
    id: 'tur-001',
    medico: medicoCardiologoMock,
    paciente: null,
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
    sede: null,
    especialidad: especialidadCardiologiaMock,
    practica: null,
    estado: EstadoTurno.DISPONIBLE,
    historialEstados: [],
    costo: especialidadCardiologiaMock.costoConsulta,
    ...overrides,
  };
}

export function crearTurnoMock(overrides = {}) {
  return Turno.create(crearDatosTurnoMock(overrides));
}

export function crearDatosTurnoDentroDeDisponibilidadMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-ok-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:40'),
    ...overrides,
  });
}

export function crearDatosTurnoFueraDeDisponibilidadMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-error-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '19:00'),
    ...overrides,
  });
}

export function crearDatosTurnoSuperpuestoMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-error-002',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:15'),
    ...overrides,
  });
}

export function crearDatosTurnoOtroMedicoMismoHorarioMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-ok-002',
    medico: otroMedicoMock,
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
    ...overrides,
  });
}

export function crearDatosTurnoOtroDiaMismoHorarioMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-ok-003',
    fechaHora: crearFechaProxima(DiaSemana.MIERCOLES, '08:00'),
    ...overrides,
  });
}

export function crearDatosTurnoParaActualizarMock(overrides = {}) {
  return crearDatosTurnoMock({
    id: 'tur-update-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '09:00'),
    ...overrides,
  });
}

export function crearTurnoRepositoryMock(turnosIniciales = []) {
  const turnos = [...turnosIniciales];

  return {
    findAll() {
      return turnos;
    },

    findById(id) {
      return turnos.find((turno) => turno.id === id) ?? null;
    },

    findByMedicoId(medicoId) {
      return turnos.filter((turno) => turno.medico.id === medicoId);
    },

    save(turno) {
      const index = turnos.findIndex((t) => t.id === turno.id);

      if (index === -1) {
        turnos.push(turno);
      } else {
        turnos[index] = turno;
      }

      return turno;
    },

    deleteById(id) {
      const index = turnos.findIndex((turno) => turno.id === id);

      if (index !== -1) {
        turnos.splice(index, 1);
      }
    },
  };
}
