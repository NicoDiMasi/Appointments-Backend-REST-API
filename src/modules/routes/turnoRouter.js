import { Router } from 'express';
import { turnoController } from '../turnos/controller/turnoController.js';

const turnoRouter = Router();

turnoRouter
  .route('/')
  .get((req, res) => turnoController.findAll(req, res))
  .post((req, res) => turnoController.create(req, res));

turnoRouter
  .route('/:id')
  .get((req, res) => turnoController.findById(req, res))
  .patch((req, res) => turnoController.update(req, res))
  .delete((req, res) => turnoController.delete(req, res));

turnoRouter
  .route('/:id/cancelaciones')
  .post((req, res) => turnoController.darDeBaja(req, res)); //Cambio el PATCH

export default turnoRouter;
