import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all parking zones
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM parking_zones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single parking zone
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM parking_zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking zone not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new parking zone
router.post('/', async (req, res, next) => {
  try {
    const { zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status } = req.body;
    const result = await pool.query(
      `INSERT INTO parking_zones (zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update parking zone
router.put('/:id', async (req, res, next) => {
  try {
    const { zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status } = req.body;
    const result = await pool.query(
      `UPDATE parking_zones SET zone_name=$1, level=$2, zone_type=$3, total_spots=$4, occupied_spots=$5, available_spots=$6, hourly_rate=$7, revenue_today=$8, sensor_status=$9, peak_occupancy_time=$10, status=$11
       WHERE id=$12 RETURNING *`,
      [zone_name, level, zone_type, total_spots, occupied_spots, available_spots, hourly_rate, revenue_today, sensor_status, peak_occupancy_time, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking zone not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete parking zone
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM parking_zones WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking zone not found' });
    }
    res.json({ message: 'Parking zone deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM parking_zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking zone not found' });
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
          { role: 'system', content: 'You are an AI parking management expert. Analyze parking zone data and provide recommendations for revenue optimization, traffic flow, and utilization.' },
          { role: 'user', content: `Analyze this parking zone data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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

export default router;
