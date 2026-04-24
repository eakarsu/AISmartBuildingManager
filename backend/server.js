import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';

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
import authMiddleware from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
