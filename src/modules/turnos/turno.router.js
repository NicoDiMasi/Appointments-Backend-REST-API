import { Router } from 'express';
import { turnoController } from './controller/turnoController.js';

const router = Router();

router
  .route('/')
  .get((req, res, next) => turnoController.findAll(req, res, next))
  .post((req, res, next) => turnoController.create(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => turnoController.findById(req, res, next))
  .patch((req, res, next) => turnoController.update(req, res, next)) 
  .delete((req, res, next) => turnoController.delete(req, res, next));

export default router;

/*

*/
