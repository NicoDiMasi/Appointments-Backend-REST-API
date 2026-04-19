import express from 'express';
import healthRouter from './modules/health/health.router.js';

const app = express();

app.use(express.json());//Middleware que parsea el body de los request como JSON

// rutas
app.get('/', (req, res) => {
  res.send('Bienvenido a Sweet Medical');
});

app.use('/health', healthRouter);

export default app;