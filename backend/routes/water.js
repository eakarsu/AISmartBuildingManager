import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all water systems
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM water_systems ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single water system
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM water_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Water system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new water system
router.post('/', async (req, res, next) => {
  try {
    const { name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection } = req.body;
    const result = await pool.query(
      `INSERT INTO water_systems (name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update water system
router.put('/:id', async (req, res, next) => {
  try {
    const { name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection } = req.body;
    const result = await pool.query(
      `UPDATE water_systems SET name=$1, zone=$2, floor=$3, system_type=$4, flow_rate=$5, daily_usage=$6, pressure=$7, quality_index=$8, leak_detected=$9, status=$10, last_inspection=$11
       WHERE id=$12 RETURNING *`,
      [name, zone, floor, system_type, flow_rate, daily_usage, pressure, quality_index, leak_detected, status, last_inspection, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Water system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete water system
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM water_systems WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Water system not found' });
    }
    res.json({ message: 'Water system deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM water_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Water system not found' });
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
          { role: 'system', content: 'You are an AI building water management expert. Analyze water system data and provide recommendations for conservation, leak prevention, and efficiency.' },
          { role: 'user', content: `Analyze this water system data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
