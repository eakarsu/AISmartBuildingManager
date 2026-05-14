import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = Router();

// GET / - list all HVAC units (with pagination)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const result = await pool.query('SELECT * FROM hvac_units ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
    const countResult = await pool.query('SELECT COUNT(*) FROM hvac_units');
    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single HVAC unit
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM hvac_units WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'HVAC unit not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new HVAC unit
router.post('/', async (req, res, next) => {
  try {
    const { name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained } = req.body;
    const result = await pool.query(
      `INSERT INTO hvac_units (name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update HVAC unit
router.put('/:id', async (req, res, next) => {
  try {
    const { name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained } = req.body;
    const result = await pool.query(
      `UPDATE hvac_units SET name=$1, zone=$2, floor=$3, status=$4, current_temp=$5, target_temp=$6, efficiency=$7, mode=$8, energy_kwh=$9, last_maintained=$10
       WHERE id=$11 RETURNING *`,
      [name, zone, floor, status, current_temp, target_temp, efficiency, mode, energy_kwh, last_maintained, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'HVAC unit not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete HVAC unit
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM hvac_units WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'HVAC unit not found' });
    }
    res.json({ message: 'HVAC unit deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM hvac_units WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'HVAC unit not found' });
    }
    const item = result.rows[0];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: 'You are an AI building management expert. Analyze HVAC unit performance and suggest optimizations for energy efficiency and comfort.' },
          { role: 'user', content: `Analyze this HVAC unit data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
        ],
      }),
    });

    const data = await response.json();

    res.json({
      analysis: {
        content: data.choices?.[0]?.message?.content || 'No analysis available',
        model: data.model || process.env.OPENROUTER_MODEL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /:id/check-thresholds — check HVAC readings against configured limits
router.post('/:id/check-thresholds', aiRateLimiter, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM hvac_units WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'HVAC unit not found' });
    const unit = result.rows[0];

    // Default thresholds (can be overridden from request body)
    const thresholds = {
      max_temp: req.body.max_temp ?? 28,
      min_temp: req.body.min_temp ?? 18,
      min_efficiency: req.body.min_efficiency ?? 70,
      max_energy_kwh: req.body.max_energy_kwh ?? 100,
    };

    const alerts = [];
    if (unit.current_temp > thresholds.max_temp) {
      alerts.push({ severity: 'critical', field: 'current_temp', value: unit.current_temp, threshold: thresholds.max_temp, message: `Temperature ${unit.current_temp}°C exceeds maximum ${thresholds.max_temp}°C` });
    }
    if (unit.current_temp < thresholds.min_temp) {
      alerts.push({ severity: 'warning', field: 'current_temp', value: unit.current_temp, threshold: thresholds.min_temp, message: `Temperature ${unit.current_temp}°C below minimum ${thresholds.min_temp}°C` });
    }
    if (unit.efficiency < thresholds.min_efficiency) {
      alerts.push({ severity: 'warning', field: 'efficiency', value: unit.efficiency, threshold: thresholds.min_efficiency, message: `Efficiency ${unit.efficiency}% below minimum ${thresholds.min_efficiency}%` });
    }
    if (unit.energy_kwh > thresholds.max_energy_kwh) {
      alerts.push({ severity: 'warning', field: 'energy_kwh', value: unit.energy_kwh, threshold: thresholds.max_energy_kwh, message: `Energy usage ${unit.energy_kwh} kWh exceeds limit ${thresholds.max_energy_kwh} kWh` });
    }

    res.json({
      unit_id: unit.id,
      unit_name: unit.name,
      thresholds,
      alerts,
      status: alerts.some((a) => a.severity === 'critical') ? 'critical' : alerts.length > 0 ? 'warning' : 'ok',
      checked_at: new Date().toISOString(),
    });
  } catch (err) { next(err); }
});

export default router;
