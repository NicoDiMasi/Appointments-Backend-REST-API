import { pacienteService } from '../service/PacienteService.js';

export const PacienteController = {
  
  async findAll(req, res, next) {
    try {
      const pacientes = await pacienteService.findAll();

      return res.status(200).json(pacientes);
    } catch (error) {
      return next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const paciente = await pacienteService.findById(req.params.id);

      return res.status(200).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const paciente = await pacienteService.crearPaciente(req.body);

      return res.status(201).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const paciente = await pacienteService.actualizarPaciente(req.params.id, req.body);

      return res.status(200).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await pacienteService.eliminarPaciente(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  async reservarTurno(req, res, next) {
    try {
      const turno = await pacienteService.reservarTurno(req.params.id, req.body);

      return res.status(201).json(turno);
    } catch (error) {
      return next(error);
    }
  },

  async cancelarTurno(req, res, next) {
    try {
      const turno = await pacienteService.cancelarTurno(
        req.params.id,
        req.params.turnoId,
        req.body.motivo
      );

      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  },

  async consultarHistorialTurnos(req, res, next) {
    try {
      const turnos = await pacienteService.consultarHistorialTurnos(req.params.id);

      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  },

  async cambiarTurno(req, res, next) {
    try {
      const turno = await pacienteService.cambiarTurno(
        req.params.id,
        req.params.turnoId,
        req.body
      );

      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  },

  async buscarTurnosDisponibles(req, res, next) {
    try {
      const turnos = await pacienteService.buscarTurnosDisponibles(
          req.params.id,
          req.query
      );

      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  },
};
