import { TurnoService } from './modules/turnos/service/TurnoService.js';

import {
  crearTurnoMock,
  crearTurnoRepositoryMock,
  crearDatosTurnoDentroDeDisponibilidadMock,
  crearDatosTurnoFueraDeDisponibilidadMock,
  crearDatosTurnoSuperpuestoMock,
  crearDatosTurnoOtroMedicoMismoHorarioMock,
  crearDatosTurnoOtroDiaMismoHorarioMock,
  crearFechaProxima,
  usuarioAdminMock,
} from './modules/turnos/mocks/turnos.mocks.js';

import { DiaSemana } from './modules/medicos/domain/DiaSemana.js';

function probarOK(nombre, callback) {
  try {
    callback();
    console.log(`✅ ${nombre}`);
  } catch (error) {
    console.log(`❌ ${nombre}`);
    console.log(`   ${error.name}: ${error.message}`);
  }
}

function probarQueFalla(nombre, callback) {
  try {
    callback();
    console.log(`❌ ${nombre}`);
    console.log('   Se esperaba un error, pero no falló');
  } catch (error) {
    console.log(`✅ ${nombre}`);
    console.log(`   Error esperado: ${error.message}`);
  }
}

probarOK('Crear turno dentro de disponibilidad', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  const datosTurno = crearDatosTurnoDentroDeDisponibilidadMock({
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '09:20'),
  });

  turnoService.crearTurno(datosTurno);
});

probarQueFalla('No permitir turno fuera de disponibilidad', () => {
  const turnoRepositoryMock = crearTurnoRepositoryMock([]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  const datosTurno = crearDatosTurnoFueraDeDisponibilidadMock();

  turnoService.crearTurno(datosTurno);
});

probarQueFalla('No permitir turno superpuesto mismo médico mismo día', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  const datosTurno = crearDatosTurnoSuperpuestoMock();

  turnoService.crearTurno(datosTurno);
});

probarOK('Permitir mismo horario con otro médico', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  const datosTurno = crearDatosTurnoOtroMedicoMismoHorarioMock();

  turnoService.crearTurno(datosTurno);
});

probarOK('Permitir mismo médico mismo horario pero otro día', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  const datosTurno = crearDatosTurnoOtroDiaMismoHorarioMock();

  turnoService.crearTurno(datosTurno);
});

probarOK('Actualizar turno existente a horario válido', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  turnoService.actualizarTurno('tur-existente-001', {
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '09:00'),
  });
});

probarQueFalla('No actualizar turno a horario superpuesto', () => {
  const turnoUno = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoDos = crearTurnoMock({
    id: 'tur-existente-002',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '09:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoUno, turnoDos]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  turnoService.actualizarTurno('tur-existente-001', {
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '09:15'),
  });
});

probarOK('Dar de baja turno existente', () => {
  const turnoExistente = crearTurnoMock({
    id: 'tur-existente-001',
    fechaHora: crearFechaProxima(DiaSemana.LUNES, '08:00'),
  });

  const turnoRepositoryMock = crearTurnoRepositoryMock([turnoExistente]);
  const turnoService = new TurnoService(turnoRepositoryMock);

  turnoService.darDeBajaTurno(
    'tur-existente-001',
    usuarioAdminMock,
    'Cancelación de prueba'
  );
});
