import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lighting_zones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lighting_zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lighting zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion } = req.body;
    const result = await pool.query(
      `INSERT INTO lighting_zones (name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion } = req.body;
    const result = await pool.query(
      `UPDATE lighting_zones SET name=$1, floor=$2, zone=$3, occupancy_count=$4, brightness_level=$5, mode=$6, schedule=$7, energy_usage=$8, status=$9, last_motion=$10
       WHERE id=$11 RETURNING *`,
      [name, floor, zone, occupancy_count, brightness_level, mode, schedule, energy_usage, status, last_motion, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lighting zone not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM lighting_zones WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lighting zone not found' });
    res.json({ message: 'Lighting zone deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lighting_zones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lighting zone not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze lighting zone usage patterns and recommend energy-saving adjustments.' },
          { role: 'user', content: `Analyze this lighting zone data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
