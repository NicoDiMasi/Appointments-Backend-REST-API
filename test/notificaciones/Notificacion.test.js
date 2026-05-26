import { describe, test, expect } from '@jest/globals';
import { Notificacion } from '../../src/modules/notificaciones/domain/Notificacion.js';
import { TipoNotificacion } from '../../src/modules/notificaciones/domain/TipoNotificacion.js';

const datosValidos = {
  id: 'notif-001',
  destinatarioId: 'med-001',
  destinatarioTipo: 'medico',
  remitenteId: 'pac-001',
  remitenteTipo: 'paciente',
  mensaje: 'El paciente Juan Lopez reservo un turno de Cardiologia.',
  tipo: TipoNotificacion.RESERVA_TURNO,
};

describe('Notificacion', () => {
  test('create() con datos validos devuelve instancia correcta', () => {
    const notificacion = Notificacion.create(datosValidos);
    expect(notificacion.id).toBe('notif-001');
    expect(notificacion.destinatarioId).toBe('med-001');
    expect(notificacion.leida).toBe(false);
    expect(notificacion.fechaHoraLeida).toBeNull();
    expect(notificacion.fechaHoraCreacion).toBeInstanceOf(Date);
  });

  test('create() sin destinatarioId lanza error', () => {
    expect(() =>
      Notificacion.create({ ...datosValidos, destinatarioId: '' })
    ).toThrow('destinatarioId es obligatorio');
  });

  test('create() con destinatarioTipo invalido lanza error', () => {
    expect(() =>
      Notificacion.create({ ...datosValidos, destinatarioTipo: 'enfermero' })
    ).toThrow("destinatarioTipo debe ser 'paciente' o 'medico'");
  });

  test('create() con tipo de notificacion invalido lanza error', () => {
    expect(() =>
      Notificacion.create({ ...datosValidos, tipo: 'TIPO_INEXISTENTE' })
    ).toThrow(/tipo debe ser uno de/);
  });

  test('create() sin mensaje lanza error', () => {
    expect(() =>
      Notificacion.create({ ...datosValidos, mensaje: '' })
    ).toThrow('El mensaje es obligatorio');
  });

  test('create() sin remitenteId lanza error', () => {
    expect(() =>
      Notificacion.create({ ...datosValidos, remitenteId: '' })
    ).toThrow('remitenteId es obligatorio');
  });
});
