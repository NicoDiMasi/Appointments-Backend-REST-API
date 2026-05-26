import { TurnoService } from '../service/TurnoService.js';
import { turnoRepository } from '../repository/TurnoRepository.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';
import { parsearFechaHoraArgentina } from '../../../utils/dateTime.js';

export class TurnoController {
  constructor(turnoService = new TurnoService(turnoRepository)) {
    this.turnoService = turnoService;
  }

  async findAll(req, res, next) {
    try {
      const turnos = await this.turnoService.findAll();
      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const turno = await this.turnoService.findById(req.params.id);
      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  }

  async consultarDisponibilidad(req, res, next) {
    try {
      const disponibilidad = await this.turnoService.consultarDisponibilidad(req.query);
      return res.status(200).json(disponibilidad);
    } catch (error) {
      return next(error);
    }
  }

  async generarTurnosDisponibles(req, res, next) {
    try {
      const turnos = await this.turnoService.generarTurnosDisponibles(req.query);
      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const datosTurno = {
        ...req.body,
        fechaHora: parsearFechaHoraArgentina(req.body.fechaHora),
      };
      const turnoCreado = await this.turnoService.crearTurno(datosTurno);
      return res.status(201).json(turnoCreado);
    } catch (error) {
      return next(error);
    }
  }

  async solicitar(req, res, next) {
    try {
      const datosTurno = {
        ...req.body,
        fechaHora: parsearFechaHoraArgentina(req.body.fechaHora),
      };
      const resultado = await this.turnoService.solicitarTurno(datosTurno);
      return res.status(201).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      if (req.body.estado === EstadoTurno.CANCELADO) {
        return this.darDeBaja(req, res, next);
      }

      if (req.body.estado === EstadoTurno.REALIZADO) {
        const usuario = req.body.usuario ?? { id: 'sistema', nombre: 'Sistema' };
        const turnoRealizado = await this.turnoService.marcarTurnoRealizado(req.params.id, usuario);
        return res.status(200).json(turnoRealizado);
      }

      const turnoActualizado = await this.turnoService.actualizarTurno(req.params.id, req.body);
      return res.status(200).json(turnoActualizado);
    } catch (error) {
      return next(error);
    }
  }

  async darDeBaja(req, res, next) {
    try {
      const usuario = req.body.usuario ?? { id: 'sistema', nombre: 'Sistema' };
      const motivo = req.body.motivo ?? 'Baja de turno';
      const turnoCancelado = await this.turnoService.darDeBajaTurno(req.params.id, usuario, motivo);
      return res.status(200).json(turnoCancelado);
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.turnoService.eliminarTurno(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export const turnoController = new TurnoController();