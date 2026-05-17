import express from 'express';
import healthRouter from './modules/health/health.router.js';
import medicosRouter from './modules/medicos/medicos.router.js';
import router from './modules/routes/router.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a Sweet Medical');
});

app.use('/health', healthRouter);
app.use('/medicos', medicosRouter);
app.use(router);

export default app;
