import { Router } from 'express';
import { formatearFechaHoraArgentina } from '../../utils/dateTime.js';

const router = Router();

/*No tiene lógica de negocio ya que solo consulta el estado del proceso activo*/
router.get('/', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: formatearFechaHoraArgentina(new Date()),
    uptime: process.uptime(),
  });
});

export default router;
