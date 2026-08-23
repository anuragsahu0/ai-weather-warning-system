import { Router } from 'express';
import { demoController } from '../controllers/demoController.js';

export const demoRouter = Router();

demoRouter.get('/scenarios', demoController.getScenarios);
demoRouter.get('/state', demoController.getActiveState);
demoRouter.post('/replay/step', demoController.stepReplay);
demoRouter.post('/replay/reset', demoController.resetReplay);
demoRouter.get('/lineage/trace', demoController.getLineageTrace);
demoRouter.get('/preflight', demoController.getPreflightDiagnostics);
