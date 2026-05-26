import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import router from './modules/routes/router.js';
import { errorLogger } from './middlewares/errorLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const documentacionApiPath = path.join(__dirname, '../docs/documentacion-api.yaml');
const swaggerDocument = YAML.load(documentacionApiPath);

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a Sweet Medical');
});

app.get('/documentacion-api.yaml', (req, res) => {
  res.sendFile(documentacionApiPath);
});

app.use('/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(router);

app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);



export default app;
