import { Router } from 'express';
import { fusedWeatherController } from '../controllers/fusedWeatherController.js';

const router = Router();

// GET /api/weather/fused
router.get('/fused', (req, res, next) => fusedWeatherController.getFusedWeather(req, res, next));

// GET /api/weather/radar
router.get('/radar', (req, res, next) => fusedWeatherController.getRadarTiles(req, res, next));

// GET /api/weather/lightning
router.get('/lightning', (req, res, next) =>
  fusedWeatherController.getLightningActivity(req, res, next)
);

export const fusedWeatherRoutes = router;
