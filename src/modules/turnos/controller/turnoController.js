import { TurnoService } from '../service/TurnoService.js';
import { turnoRepository } from '../repository/TurnoRepository.js';

export class TurnoController {
  constructor(turnoService = new TurnoService(turnoRepository)) {
    this.turnoService = turnoService;
  }

  findAll(req, res) {
    try {
      const turnos = this.turnoService.findAll();

      return res.status(200).json(turnos);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  findById(req, res) {
    try {
      const turno = this.turnoService.findById(req.params.id);

      return res.status(200).json(turno);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  create(req, res) {
    try {
      const turnoCreado = this.turnoService.crearTurno(req.body);

      return res.status(201).json(turnoCreado);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  update(req, res) {
    try {
      const turnoActualizado = this.turnoService.actualizarTurno(
        req.params.id,
        req.body
      );

      return res.status(200).json(turnoActualizado);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  darDeBaja(req, res) {
    try {
      const usuario = req.body.usuario ?? {
        id: 'sistema',
        nombre: 'Sistema',
      };

      const motivo = req.body.motivo ?? 'Baja de turno';

      const turnoCancelado = this.turnoService.darDeBajaTurno(
        req.params.id,
        usuario,
        motivo
      );

      return res.status(200).json(turnoCancelado);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  delete(req, res) {
    try {
      this.turnoService.eliminarTurno(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  handleError(res, error) {
    return res.status(error.statusCode ?? 500).json({
      error: error.name ?? 'Error',
      message: error.message ?? 'Error interno del servidor',
    });
  }
}

export const turnoController = new TurnoController();