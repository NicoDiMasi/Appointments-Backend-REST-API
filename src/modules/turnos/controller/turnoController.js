import { TurnoService } from '../service/TurnoService.js';
import { turnoRepository } from '../repository/TurnoRepository.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';
import { parsearFechaHoraArgentina } from '../../../utils/dateTime.js';

export class TurnoController {
  constructor(turnoService = new TurnoService(turnoRepository)) {
    this.turnoService = turnoService;
  }

  findAll(req, res, next) {
    try {
      const turnos = this.turnoService.findAll();

      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  }

  findById(req, res, next) {
    try {
      const turno = this.turnoService.findById(req.params.id);

      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  }

  consultarDisponibilidad(req, res, next) {
    try {
      const disponibilidad = this.turnoService.consultarDisponibilidad(req.query);

      return res.status(200).json(disponibilidad);
    } catch (error) {
      return next(error);
    }
  }

  generarTurnosDisponibles(req, res, next) {
    try {
      const turnos = this.turnoService.generarTurnosDisponibles(req.query);

      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  }

  create(req, res, next) {
    try {
      const datosTurno = {
        ...req.body,
        fechaHora: parsearFechaHoraArgentina(req.body.fechaHora),
      };
      const turnoCreado = this.turnoService.crearTurno(datosTurno);

      return res.status(201).json(turnoCreado);
    } catch (error) {
      return next(error);
    }
  }

  solicitar(req, res, next) {
    try {
      const datosTurno = {
        ...req.body,
        fechaHora: parsearFechaHoraArgentina(req.body.fechaHora),
      };
      const resultado = this.turnoService.solicitarTurno(datosTurno);

      return res.status(201).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  update(req, res, next) {
    try {
      if (req.body.estado === EstadoTurno.CANCELADO) {
        return this.darDeBaja(req, res, next);
      }

      if (req.body.estado === EstadoTurno.REALIZADO) {
        const usuario = req.body.usuario ?? {
          id: 'sistema',
          nombre: 'Sistema',
        };
        const turnoRealizado = this.turnoService.marcarTurnoRealizado(
          req.params.id,
          usuario
        );

        return res.status(200).json(turnoRealizado);
      }

      const turnoActualizado = this.turnoService.actualizarTurno(
        req.params.id,
        req.body
      );

      return res.status(200).json(turnoActualizado);
    } catch (error) {
      return next(error);
    }
  }

  darDeBaja(req, res, next) {
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
      return next(error);
    }
  }

  delete(req, res, next) {
    try {
      this.turnoService.eliminarTurno(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export const turnoController = new TurnoController();
