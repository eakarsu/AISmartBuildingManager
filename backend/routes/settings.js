import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const DEFAULT_SETTINGS = [
  // general
  { key: 'building_name', value: 'Smart Building HQ', category: 'general', description: 'Name of the building' },
  { key: 'total_floors', value: '15', category: 'general', description: 'Total number of floors in the building' },
  { key: 'timezone', value: 'America/New_York', category: 'general', description: 'Building timezone' },
  { key: 'operating_hours', value: '06:00-22:00', category: 'general', description: 'Daily operating hours' },
  // notifications
  { key: 'email_alerts', value: 'true', category: 'notifications', description: 'Enable email alert notifications' },
  { key: 'alert_threshold', value: 'warning', category: 'notifications', description: 'Minimum severity level for alerts' },
  { key: 'notify_maintenance', value: 'true', category: 'notifications', description: 'Send notifications for maintenance events' },
  { key: 'notify_security', value: 'true', category: 'notifications', description: 'Send notifications for security events' },
  // security
  { key: 'auto_lockdown', value: 'false', category: 'security', description: 'Automatically lock down building during emergencies' },
  { key: 'visitor_badge_required', value: 'true', category: 'security', description: 'Require visitor badges for all guests' },
  { key: 'camera_retention_days', value: '30', category: 'security', description: 'Number of days to retain security camera footage' },
  { key: 'access_log_retention', value: '90', category: 'security', description: 'Number of days to retain access logs' },
  // energy
  { key: 'peak_hours_start', value: '09:00', category: 'energy', description: 'Start time for peak energy hours' },
  { key: 'peak_hours_end', value: '17:00', category: 'energy', description: 'End time for peak energy hours' },
  { key: 'energy_target_kwh', value: '5000', category: 'energy', description: 'Daily energy consumption target in kWh' },
  { key: 'solar_enabled', value: 'false', category: 'energy', description: 'Enable solar panel integration' },
  // maintenance
  { key: 'auto_schedule', value: 'true', category: 'maintenance', description: 'Automatically schedule routine maintenance' },
  { key: 'inspection_interval_days', value: '30', category: 'maintenance', description: 'Days between routine inspections' },
  { key: 'warranty_alert_days', value: '60', category: 'maintenance', description: 'Days before warranty expiry to send alerts' },
  { key: 'emergency_contact', value: '555-0100', category: 'maintenance', description: 'Emergency maintenance contact number' },
];

// GET / - list all settings
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM building_settings ORDER BY category, key');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /category/:category - get settings by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM building_settings WHERE category = $1 ORDER BY key',
      [req.params.category]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT /:key - update a setting by key (upsert)
router.put('/:key', async (req, res, next) => {
  try {
    const { value, category, description } = req.body;
    const result = await pool.query(
      `INSERT INTO building_settings (key, value, category, description, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, category = COALESCE($3, building_settings.category), description = COALESCE($4, building_settings.description), updated_at = NOW()
       RETURNING *`,
      [req.params.key, value, category || null, description || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /reset - reset all settings to defaults
router.post('/reset', async (req, res, next) => {
  try {
    await pool.query('TRUNCATE building_settings RESTART IDENTITY');
    for (const s of DEFAULT_SETTINGS) {
      await pool.query(
        `INSERT INTO building_settings (key, value, category, description, updated_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [s.key, s.value, s.category, s.description]
      );
    }
    const result = await pool.query('SELECT * FROM building_settings ORDER BY category, key');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
