import { Router } from 'express';

const router = Router();

/*No tiene lógica de negocio ya que solo consulta el estado del proceso activo*/
router.get('/', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
