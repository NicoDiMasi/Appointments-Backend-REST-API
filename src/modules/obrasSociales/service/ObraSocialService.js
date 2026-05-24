import { obraSocialRepository } from '../repository/ObraSocialRepository.js';
import {
  ObraSocialNotFoundError,
  PlanNotFoundError,
} from '../errors/ObraSocialErrors.js';

export const ObraSocialService = {
  listar() {
    return obraSocialRepository.findAll();
  },

  buscarPorId(obraSocialId) {
    const obraSocial = obraSocialRepository.findById(obraSocialId);

    if (!obraSocial) {
      throw new ObraSocialNotFoundError(obraSocialId);
    }

    return obraSocial;
  },

  listarPlanes(obraSocialId) {
    return this.buscarPorId(obraSocialId).planes;
  },

  buscarPlan(obraSocialId, planId) {
    this.buscarPorId(obraSocialId);

    const plan = obraSocialRepository.findPlanById(obraSocialId, planId);

    if (!plan) {
      throw new PlanNotFoundError(planId);
    }

    return plan;
  },
};

