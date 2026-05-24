import { Router } from 'express';
import { ObraSocialController } from './controller/ObraSocialController.js';

const router = Router();

router
  .route('/')
  .get(ObraSocialController.listar);

router
  .route('/:obraSocialId')
  .get(ObraSocialController.buscarPorId);

router
  .route('/:obraSocialId/planes')
  .get(ObraSocialController.listarPlanes);

router
  .route('/:obraSocialId/planes/:planId')
  .get(ObraSocialController.buscarPlan);

export default router;

