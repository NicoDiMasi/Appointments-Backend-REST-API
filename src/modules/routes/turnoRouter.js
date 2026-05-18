import { Router } from 'express';
import { turnoController } from '../turnos/controller/turnoController.js';

const turnoRouter = Router();

turnoRouter
  .route('/')
  .get((req, res, next) => turnoController.findAll(req, res, next))
  .post((req, res, next) => turnoController.create(req, res, next));

turnoRouter
  .route('/:id')
  .get((req, res, next) => turnoController.findById(req, res, next))
  .patch((req, res, next) => turnoController.update(req, res, next))
  .delete((req, res, next) => turnoController.delete(req, res, next));

turnoRouter
  .route('/:id/cancelaciones')
  .post((req, res, next) => turnoController.darDeBaja(req, res, next)); //Cambio el PATCH

export default turnoRouter;
