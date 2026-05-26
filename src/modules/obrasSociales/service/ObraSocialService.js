import { obraSocialRepository } from '../repository/ObraSocialRepository.js';
import {
  ObraSocialNotFoundError,
  PlanNotFoundError,
} from '../errors/ObraSocialErrors.js';

export const ObraSocialService = {
  async listar() {
    return obraSocialRepository.findAll();
  },

  async buscarPorId(obraSocialId) {
    const obraSocial = await obraSocialRepository.findById(obraSocialId);

    if (!obraSocial) {
      throw new ObraSocialNotFoundError(obraSocialId);
    }

    return obraSocial;
  },

  async listarPlanes(obraSocialId) {
    return (await this.buscarPorId(obraSocialId)).planes;
  },

  async buscarPlan(obraSocialId, planId) {
    await this.buscarPorId(obraSocialId);

    const plan = await obraSocialRepository.findPlanById(obraSocialId, planId);

    if (!plan) {
      throw new PlanNotFoundError(planId);
    }

    return plan;
  },
};