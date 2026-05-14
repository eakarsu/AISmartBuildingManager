import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import hvacRoutes from './routes/hvac.js';
import lightingRoutes from './routes/lighting.js';
import climateRoutes from './routes/climate.js';
import maintenanceRoutes from './routes/maintenance.js';
import energyRoutes from './routes/energy.js';
import comfortRoutes from './routes/comfort.js';
import securityRoutes from './routes/security.js';
import spaceRoutes from './routes/space.js';
import waterRoutes from './routes/water.js';
import parkingRoutes from './routes/parking.js';
import visitorRoutes from './routes/visitors.js';
import wasteRoutes from './routes/waste.js';
import fireRoutes from './routes/fire.js';
import elevatorRoutes from './routes/elevators.js';
import alertRoutes from './routes/alerts.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import activityRoutes from './routes/activity.js';
import profileRoutes from './routes/profile.js';
import aiRoutes from './routes/ai.js';
import authMiddleware from './middleware/auth.js';
import pool from './db.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Activity log middleware — auto-log POST/PUT/DELETE
app.use(async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.path.startsWith('/api/auth')) {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      try {
        const resourceMatch = req.path.match(/^\/api\/([^/]+)/);
        const resourceType = resourceMatch ? resourceMatch[1] : 'unknown';
        const idMatch = req.path.match(/\/(\d+)/);
        pool.query(
          `INSERT INTO activity_log (user_name, user_email, action, resource_type, resource_id, description, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user?.name || 'system',
            req.user?.email || null,
            req.method,
            resourceType,
            idMatch ? parseInt(idMatch[1]) : null,
            `${req.method} ${req.path}`,
            req.ip,
          ]
        ).catch(() => {});
      } catch (_) {}
      return originalJson(data);
    };
  }
  next();
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/hvac', authMiddleware, hvacRoutes);
app.use('/api/lighting', authMiddleware, lightingRoutes);
app.use('/api/climate', authMiddleware, climateRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);
app.use('/api/energy', authMiddleware, energyRoutes);
app.use('/api/comfort', authMiddleware, comfortRoutes);
app.use('/api/security', authMiddleware, securityRoutes);
app.use('/api/space', authMiddleware, spaceRoutes);
app.use('/api/water', authMiddleware, waterRoutes);
app.use('/api/parking', authMiddleware, parkingRoutes);
app.use('/api/visitors', authMiddleware, visitorRoutes);
app.use('/api/waste', authMiddleware, wasteRoutes);
app.use('/api/fire', authMiddleware, fireRoutes);
app.use('/api/elevators', authMiddleware, elevatorRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/activity', authMiddleware, activityRoutes);
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Initialize ai_results table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    input_data JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch((err) => console.error('Failed to create ai_results table:', err.message));

const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;

// AI feature mount: predictive-maintenance
import aiPredictivemaintenanceRoutes from './routes/ai-predictive-maintenance.js';
app.use('/api/ai/predictive-maintenance', aiPredictivemaintenanceRoutes);
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-occupancyoptimization-hvaclighting-autotu', require('./routes/gap-no-occupancyoptimization-hvaclighting-autotu'));
app.use('/api/gap-no-predictivemaintenance-failure-prediction', require('./routes/gap-no-predictivemaintenance-failure-prediction'));
app.use('/api/gap-no-energyforecast-ai', require('./routes/gap-no-energyforecast-ai'));
app.use('/api/gap-no-comfortoptimization-energy-vs-comfort', require('./routes/gap-no-comfortoptimization-energy-vs-comfort'));
app.use('/api/gap-no-securityanomalydetection', require('./routes/gap-no-securityanomalydetection'));
app.use('/api/gap-no-waterusageoptimization-leak-detection', require('./routes/gap-no-waterusageoptimization-leak-detection'));
app.use('/api/gap-no-realtime-building-dashboard-route-stubs-o', require('./routes/gap-no-realtime-building-dashboard-route-stubs-o'));
app.use('/api/gap-no-iot-device-protocol-integration-bacnet-mo', require('./routes/gap-no-iot-device-protocol-integration-bacnet-mo'));
app.use('/api/gap-no-occupant-mobile-app-endpoints', require('./routes/gap-no-occupant-mobile-app-endpoints'));
app.use('/api/gap-no-tenant-submetering-billback', require('./routes/gap-no-tenant-submetering-billback'));
app.use('/api/gap-limited-emergency-response-workflows', require('./routes/gap-limited-emergency-response-workflows'));
app.use('/api/gap-no-vendor-management-contractors', require('./routes/gap-no-vendor-management-contractors'));
app.use('/api/gap-no-demandresponse-grid-integration', require('./routes/gap-no-demandresponse-grid-integration'));
// === End Batch 07 ===
