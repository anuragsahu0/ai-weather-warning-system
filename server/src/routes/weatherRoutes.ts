import { Router } from 'express';
import { weatherController } from '../controllers/weatherController.js';
import { fusedWeatherController } from '../controllers/fusedWeatherController.js';

const router = Router();

// GET /api/weather/current?lat=28.6139&lon=77.209
router.get('/current', (req, res, next) => weatherController.getCurrentWeather(req, res, next));

// GET /api/weather/fused?lat=28.6139&lon=77.209 (Phase 7 Multi-Source Fusion)
router.get('/fused', (req, res, next) => fusedWeatherController.getFusedWeather(req, res, next));

// GET /api/weather/radar (Phase 7 Doppler Radar Tiles)
router.get('/radar', (req, res, next) => fusedWeatherController.getRadarTiles(req, res, next));

// GET /api/weather/lightning (Phase 7 Lightning Density)
router.get('/lightning', (req, res, next) =>
  fusedWeatherController.getLightningActivity(req, res, next)
);

// GET /api/weather/status
router.get('/status', (req, res, next) => weatherController.getStatus(req, res, next));

// POST /api/weather/ingest (Admin / Development Trigger)
router.post('/ingest', (req, res, next) => weatherController.manualIngest(req, res, next));

// GET /api/weather/locations
router.get('/locations', (req, res, next) => weatherController.searchLocations(req, res, next));

export const weatherRoutes = router;
