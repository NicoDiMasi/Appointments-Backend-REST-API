import { describe, test, expect } from '@jest/globals';

import { Agenda } from '../../src/modules/turnos/domain/Agenda.js';
import { Turno } from '../../src/modules/turnos/domain/Turno.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';
import { Especialidad } from '../../src/modules/medicos/domain/Especialidad.js';
import { Medico } from '../../src/modules/medicos/domain/Medico.js';
import { DisponibilidadHoraria } from '../../src/modules/medicos/domain/DisponibilidadHoraria.js';

describe('Agenda', () => {
  const agenda = new Agenda();

  const especialidad = Especialidad.create({
    id: 'esp-001',
    nombre: 'Cardiologia',
    duracionTurnoEnMins: 30,
    costoConsulta: 5000,
  });

  function crearMedicoConDisponibilidad() {
    const medico = Medico.create({
      id: 'med-001',
      matricula: 'MP-1234',
      nombre: 'Ana Gomez',
      especialidades: [especialidad],
    });

    medico.definirDisponibilidad(
      DisponibilidadHoraria.create({
        diaSemana: 'LUNES',
        horaDesde: '08:00',
        horaHasta: '09:00',
      })
    );

    return medico;
  }

  function proximaFechaParaDiaYHora(diaSemana, hora) {
    const dias = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const fecha = new Date();
    const diaObjetivo = dias[diaSemana];
    const diferenciaDias = (diaObjetivo - fecha.getDay() + 7) % 7 || 7;

    fecha.setDate(fecha.getDate() + diferenciaDias);

    const [horas, minutos] = hora.split(':').map(Number);
    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
  }

  function crearTurno(fechaHora) {
    const medico = crearMedicoConDisponibilidad();

    return Turno.create({
      id: 'tur-001',
      medico,
      paciente: { id: 'pac-001', nombre: 'Paciente Demo' },
      fechaHora,
      sede: { id: 'sede-001', nombre: 'Sede Central' },
      especialidad,
      estado: EstadoTurno.CONFIRMADO,
      historialEstados: [],
      costo: especialidad.costoConsulta,
    });
  }

  test('deberia generar turnos disponibles por modulos de 20 minutos', () => {
    const medico = crearMedicoConDisponibilidad();

    const turnos = agenda.generarTurnosParaEspecialidad(especialidad, medico);

    expect(turnos).toHaveLength(3);
    expect(turnos.map(turno => turno.inicioTurno())).toEqual([480, 500, 520]);
    expect(turnos.every(turno => turno.duracionTurno === 20)).toBe(true);
    expect(turnos.every(turno => turno.modulosRequeridos === 2)).toBe(true);
  });

  test('deberia redondear la duracion de la prestacion a modulos completos', () => {
    const turno = crearTurno(proximaFechaParaDiaYHora('LUNES', '08:00'));

    expect(turno.modulosRequeridos).toBe(2);
    expect(turno.duracionTurno).toBe(40);
  });

  test('deberia rechazar turnos que no inician en un modulo programado', () => {
    const turno = crearTurno(proximaFechaParaDiaYHora('LUNES', '08:30'));

    expect(agenda.estaDisponible(turno)).toBe(false);
  });
});
