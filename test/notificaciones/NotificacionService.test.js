import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { NotificacionService } from '../../src/modules/notificaciones/service/NotificacionService.js';
import { NotificacionNotFoundError } from '../../src/modules/notificaciones/errors/NotificacionErrors.js';
import { TipoNotificacion } from '../../src/modules/notificaciones/domain/TipoNotificacion.js';

describe('NotificacionService', () => {
  let mockRepository;
  let notificacionService;

  const datosBase = {
    destinatarioId: 'med-001',
    destinatarioTipo: 'medico',
    remitenteId: 'pac-001',
    remitenteTipo: 'paciente',
    mensaje: 'El paciente Juan Lopez reservo un turno.',
    tipo: TipoNotificacion.RESERVA_TURNO,
  };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      findByDestinatarioAndLeida: jest.fn(),
    };
    notificacionService = new NotificacionService(mockRepository);
  });

  describe('crearNotificacion', () => {
    test('llama repo.save con una Notificacion valida', async () => {
      mockRepository.save.mockResolvedValue({ id: 'notif-xxx', leida: false });

      const resultado = await notificacionService.crearNotificacion(datosBase);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const notificacionGuardada = mockRepository.save.mock.calls[0][0];
      expect(notificacionGuardada.destinatarioId).toBe('med-001');
      expect(notificacionGuardada.tipo).toBe(TipoNotificacion.RESERVA_TURNO);
      expect(resultado.leida).toBe(false);
    });

    test('lanza NotificacionInvalidaError si datos invalidos', async () => {
      let thrownError = null;
      try {
        await notificacionService.crearNotificacion({ ...datosBase, tipo: 'TIPO_INVALIDO' });
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError.message).toContain('tipo debe ser uno de');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getNoLeidas', () => {
    test('llama repo.findByDestinatarioAndLeida con leida=false', async () => {
      mockRepository.findByDestinatarioAndLeida.mockResolvedValue([]);

      await notificacionService.getNoLeidas('pac-001');

      expect(mockRepository.findByDestinatarioAndLeida).toHaveBeenCalledWith('pac-001', false);
    });
  });

  describe('getLeidas', () => {
    test('llama repo.findByDestinatarioAndLeida con leida=true', async () => {
      mockRepository.findByDestinatarioAndLeida.mockResolvedValue([]);

      await notificacionService.getLeidas('pac-001');

      expect(mockRepository.findByDestinatarioAndLeida).toHaveBeenCalledWith('pac-001', true);
    });
  });

  describe('marcarComoLeida', () => {
    test('lanza NotificacionNotFoundError si la notificacion no existe', async () => {
      mockRepository.findById.mockResolvedValue(null);

      let thrownError = null;
      try {
        await notificacionService.marcarComoLeida('notif-inexistente');
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).not.toBeNull();
      expect(thrownError.message).toContain('notif-inexistente');
      expect(mockRepository.updateById).not.toHaveBeenCalled();
    });

    test('llama repo.updateById con leida=true y fechaHoraLeida si existe', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'notif-001', leida: false });
      mockRepository.updateById.mockResolvedValue({ id: 'notif-001', leida: true });

      await notificacionService.marcarComoLeida('notif-001');

      expect(mockRepository.updateById).toHaveBeenCalledWith(
        'notif-001',
        expect.objectContaining({ leida: true, fechaHoraLeida: expect.any(Date) })
      );
    });
  });
});
