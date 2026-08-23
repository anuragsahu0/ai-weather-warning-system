import { Router } from 'express';
import { datasetController } from '../controllers/datasetController.js';

const router = Router();

// GET /api/datasets
router.get('/', (req, res, next) => datasetController.listDatasets(req, res, next));

// GET /api/datasets/features
router.get('/features', (req, res, next) => datasetController.getFeatures(req, res, next));

// GET /api/datasets/quality-report
router.get('/quality-report', (req, res, next) => datasetController.getQualityReport(req, res, next));

// GET /api/datasets/:datasetId/versions/:versionTag
router.get('/:datasetId/versions/:versionTag', (req, res, next) =>
  datasetController.getDatasetVersion(req, res, next)
);

// POST /api/datasets/import
router.post('/import', (req, res, next) =>
  datasetController.importHistoricalDataset(req, res, next)
);

export const datasetRoutes = router;
