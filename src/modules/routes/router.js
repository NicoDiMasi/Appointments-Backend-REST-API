import express from 'express';
import healthRouter from '../health/health.router.js';
import medicosRouter from '../medicos/medicos.router.js';
import obrasSocialesRouter from '../obrasSociales/obrasSociales.router.js';
import pacientesRouter from '../pacientes/pacientes.router.js';
import turnoRouter from '../turnos/turno.router.js';

const router = express.Router();

router.use('/health', healthRouter);
router.use('/medicos', medicosRouter);
router.use('/obras-sociales', obrasSocialesRouter);
router.use('/pacientes', pacientesRouter);
router.use('/turnos', turnoRouter);

export default router;
