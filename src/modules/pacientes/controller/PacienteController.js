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
      const paciente = pacienteService.create(req.body);

      return res.status(201).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  update(req, res, next) {
    try {
      const paciente = pacienteService.update(req.params.id, req.body);

      return res.status(200).json(paciente);
    } catch (error) {
      return next(error);
    }
  },

  delete(req, res, next) {
    try {
      pacienteService.delete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
