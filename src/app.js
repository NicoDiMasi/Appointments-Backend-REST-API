import express from 'express';
import healthRouter from './modules/health/health.router.js';
import medicosRouter from './modules/medicos/medicos.router.js';
import turnoRouter from './modules/routes/turnoRouter.js';
import router from './modules/routes/router.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a Sweet Medical');
});

app.use('/health', healthRouter);
app.use('/medicos', medicosRouter);
router.use('/turno', turnoRouter);

export default app;