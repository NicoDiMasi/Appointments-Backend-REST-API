import { ObraSocialService } from '../service/ObraSocialService.js';

export const ObraSocialController = {
  async listar(req, res, next) {
    try {
      const obrasSociales = await ObraSocialService.listar();
      return res.status(200).json(obrasSociales);
    } catch (error) {
      return next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const obraSocial = await ObraSocialService.buscarPorId(req.params.obraSocialId);
      return res.status(200).json(obraSocial);
    } catch (error) {
      return next(error);
    }
  },

  async listarPlanes(req, res, next) {
    try {
      const planes = await ObraSocialService.listarPlanes(req.params.obraSocialId);
      return res.status(200).json(planes);
    } catch (error) {
      return next(error);
    }
  },

  async buscarPlan(req, res, next) {
    try {
      const plan = await ObraSocialService.buscarPlan(
        req.params.obraSocialId,
        req.params.planId
      );
      return res.status(200).json(plan);
    } catch (error) {
      return next(error);
    }
  },
};