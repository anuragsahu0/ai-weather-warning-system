import { Router } from 'express';
import { healthRoutes } from './healthRoutes.js';
import { systemRoutes } from './systemRoutes.js';
import { weatherRoutes } from './weatherRoutes.js';
import { gridRoutes } from './gridRoutes.js';
import { datasetRoutes } from './datasetRoutes.js';
import { nowcastRoutes } from './nowcastRoutes.js';
import { mlRoutes } from './mlRoutes.js';
import { sourcesRoutes } from './sourcesRoutes.js';
import { riskRoutes } from './riskRoutes.js';
import { notificationRoutes } from './notificationRoutes.js';
import { subscriptionRoutes } from './subscriptionRoutes.js';
import { alertEventsRoutes } from './alertEventsRoutes.js';
import { demoRouter } from './demoRoutes.js';

const router = Router();

// Base Operational Endpoints (Phase 1)
router.use('/health', healthRoutes);
router.use('/system', systemRoutes);

// Real Weather Ingestion & Data Pipeline Endpoints (Phase 2 & Phase 7 Fusion)
router.use('/weather', weatherRoutes);

// Hyper-Local Geospatial Grid Engine Endpoints (Phase 3)
router.use('/grid', gridRoutes);

// Historical Weather Dataset & Feature Store Endpoints (Phase 4)
router.use('/datasets', datasetRoutes);

// AI/ML Baseline Prediction Engine Endpoints (Phase 5 & 6)
router.use('/nowcast', nowcastRoutes);
router.use('/ml', mlRoutes);

// Multi-Source Weather Intelligence Registry Endpoints (Phase 7)
router.use('/sources', sourcesRoutes);

// Hyper-Local Risk Intelligence & Early Warning Endpoints (Phase 8)
router.use('/risk', riskRoutes);

// Early-Warning Delivery & Notification Endpoints (Phase 9)
router.use('/notifications', notificationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/alerts', alertEventsRoutes);

// Scenario Replay, Preflight & Demo Control Center Endpoints (Phase 11)
router.use('/demo', demoRouter);

export const apiRoutes = router;
