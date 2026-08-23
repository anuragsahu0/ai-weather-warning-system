import { Router } from 'express';
import { gridController } from '../controllers/gridController.js';

const router = Router();

// GET /api/grid/current?lat=28.6139&lon=77.209&resolution=0.01
router.get('/current', (req, res, next) => gridController.getCurrentGrid(req, res, next));

// GET /api/grid/nearby?lat=28.6139&lon=77.209&radius=10&resolution=0.01
router.get('/nearby', (req, res, next) => gridController.getNearbyGrids(req, res, next));

// GET /api/grid/bounds?north=28.9&south=28.3&east=77.4&west=76.9&resolution=0.01
router.get('/bounds', (req, res, next) => gridController.getBoundsGrids(req, res, next));

// GET /api/grid/weather?gridId=GRID_R01_N2861_E07721
router.get('/weather', (req, res, next) => gridController.getGridWeather(req, res, next));

// GET /api/grid/history?gridId=GRID_R01_N2861_E07721
router.get('/history', (req, res, next) => gridController.getGridHistory(req, res, next));

// GET /api/grid/regions
router.get('/regions', (req, res, next) => gridController.getRegions(req, res, next));

export const gridRoutes = router;
