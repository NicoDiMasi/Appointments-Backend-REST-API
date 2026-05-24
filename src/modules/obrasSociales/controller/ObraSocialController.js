import { ObraSocialService } from '../service/ObraSocialService.js';

export const ObraSocialController = {
  listar(req, res, next) {
    try {
      const obrasSociales = ObraSocialService.listar();

      return res.status(200).json(obrasSociales);
    } catch (error) {
      return next(error);
    }
  },

  buscarPorId(req, res, next) {
    try {
      const obraSocial = ObraSocialService.buscarPorId(req.params.obraSocialId);

      return res.status(200).json(obraSocial);
    } catch (error) {
      return next(error);
    }
  },

  listarPlanes(req, res, next) {
    try {
      const planes = ObraSocialService.listarPlanes(req.params.obraSocialId);

      return res.status(200).json(planes);
    } catch (error) {
      return next(error);
    }
  },

  buscarPlan(req, res, next) {
    try {
      const plan = ObraSocialService.buscarPlan(
        req.params.obraSocialId,
        req.params.planId
      );

      return res.status(200).json(plan);
    } catch (error) {
      return next(error);
    }
  },
};

