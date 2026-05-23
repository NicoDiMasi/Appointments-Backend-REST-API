import { pacienteService } from '../service/PacienteService.js';

export const PacienteController = {
  findAll(req, res, next) {
    try {
      const pacientes = pacienteService.findAll();

      return res.status(200).json(pacientes);
    } catch (error) {
      return next(error);
    }
  },

  findById(req, res, next) {
    try {
      const paciente = pacienteService.findById(req.params.id);

      return res.status(200).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  create(req, res, next) {
    try {
      const paciente = pacienteService.crearPaciente(req.body);

      return res.status(201).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  update(req, res, next) {
    try {
      const paciente = pacienteService.actualizarPaciente(req.params.id, req.body);

      return res.status(200).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  delete(req, res, next) {
    try {
      pacienteService.eliminarPaciente(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  reservarTurno(req, res, next) {
    try {
      const turno = pacienteService.reservarTurno(req.params.id, req.body);

      return res.status(201).json(turno);
    } catch (error) {
      return next(error);
    }
  },

  cancelarTurno(req, res, next) {
    try {
      const turno = pacienteService.cancelarTurno(
        req.params.id,
        req.params.turnoId,
        req.body.motivo
      );

      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  },

  consultarHistorialTurnos(req, res, next) {
    try {
      const turnos = pacienteService.consultarHistorialTurnos(req.params.id);

      return res.status(200).json(turnos);
    } catch (error) {
      return next(error);
    }
  },

  cambiarTurno(req, res, next) {
    try {
      const turno = pacienteService.cambiarTurno(
        req.params.id,
        req.params.turnoId,
        req.body
      );

      return res.status(200).json(turno);
    } catch (error) {
      return next(error);
    }
  },
};
