import { describe, test, expect, beforeEach } from '@jest/globals';

import { PacienteService } from '../../src/modules/pacientes/service/PacienteService.js';
import { pacienteRepository } from '../../src/modules/pacientes/repository/PacienteRepository.js';
import { TurnoService } from '../../src/modules/turnos/service/TurnoService.js';
import { TurnoRepository } from '../../src/modules/turnos/repository/TurnoRepository.js';
import { medicoRepository } from '../../src/modules/medicos/repository/MedicoRepository.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';

describe('PacienteService - Turnos', () => {
  let turnoRepository;
  let pacienteService;
  let medico;
  let especialidad;

  beforeEach(() => {
    medicoRepository._medicos = medicoRepository._initMockData();
    pacienteRepository.pacientes = pacienteRepository._initMockData();

    turnoRepository = new TurnoRepository();
    turnoRepository.turnos = [];

    pacienteService = new PacienteService(
      pacienteRepository,
      new TurnoService(turnoRepository)
    );

    medico = medicoRepository.findById('med-001');
    especialidad = medico.especialidades.find(e => e.id === 'esp-001');
  });

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

  function datosReserva(overrides = {}) {
    return {
      id: overrides.id ?? 'tur-pac-001',
      medicoId: overrides.medicoId ?? medico.id,
      especialidadId: overrides.especialidadId ?? especialidad.id,
      fechaHora: overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '09:20'),
      sede: overrides.sede ?? {
        id: 'sede-001',
        nombre: 'Sede Central',
      },
    };
  }

  test('debería reservar un turno validando disponibilidad', () => {
    const turno = pacienteService.reservarTurno('pac-001', datosReserva());

    expect(turno.id).toBe('tur-pac-001');
    expect(turno.paciente.id).toBe('pac-001');
    expect(turno.medico.id).toBe('med-001');
    expect(turno.estado).toBe(EstadoTurno.RESERVADO);
  });

  test('debería rechazar una reserva fuera de disponibilidad', () => {
    expect(() => {
      pacienteService.reservarTurno('pac-001', datosReserva({
        fechaHora: proximaFechaParaDiaYHora('MARTES', '09:20'),
      }));
    }).toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
  });

  test('debería cancelar un turno del paciente con motivo y una hora de anticipación', () => {
    const turno = pacienteService.reservarTurno('pac-001', datosReserva());

    const cancelado = pacienteService.cancelarTurno(
      'pac-001',
      turno.id,
      'El paciente no puede asistir'
    );

    expect(cancelado.estado).toBe(EstadoTurno.CANCELADO);
    expect(cancelado.historialEstados[0].motivo).toBe('El paciente no puede asistir');
    expect(cancelado.historialEstados[0].usuario.id).toBe('pac-001');
  });

  test('debería rechazar una cancelación sin motivo', () => {
    const turno = pacienteService.reservarTurno('pac-001', datosReserva());

    expect(() => {
      pacienteService.cancelarTurno('pac-001', turno.id, '');
    }).toThrow('El motivo de cancelación es obligatorio');
  });

  test('debería consultar el historial personal de turnos', () => {
    pacienteService.reservarTurno('pac-001', datosReserva({ id: 'tur-pac-001' }));
    pacienteService.reservarTurno('pac-002', datosReserva({
      id: 'tur-pac-002',
      fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
    }));

    const historial = pacienteService.consultarHistorialTurnos('pac-001');

    expect(historial).toHaveLength(1);
    expect(historial[0].id).toBe('tur-pac-001');
  });

  test('debería cambiar un turno a otro slot disponible del mismo profesional', () => {
    const turno = pacienteService.reservarTurno('pac-001', datosReserva({
      fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20'),
    }));

    const nuevaFechaHora = proximaFechaParaDiaYHora('LUNES', '10:00');
    const actualizado = pacienteService.cambiarTurno('pac-001', turno.id, {
      fechaHora: nuevaFechaHora,
    });

    expect(actualizado.id).toBe(turno.id);
    expect(actualizado.medico.id).toBe('med-001');
    expect(actualizado.fechaHora).toEqual(nuevaFechaHora);
  });

  test('debería rechazar un cambio de turno a otro profesional', () => {
    const turno = pacienteService.reservarTurno('pac-001', datosReserva());

    expect(() => {
      pacienteService.cambiarTurno('pac-001', turno.id, {
        medicoId: 'med-002',
        fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
      });
    }).toThrow('El cambio de turno debe mantener el mismo profesional');
  });
});
