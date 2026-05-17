import express from 'express';
import turnoRouter from './turnoRouter.js';

const router = express.Router();

router.use('/turnos', turnoRouter);

export default router;
