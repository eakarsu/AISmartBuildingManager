import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all HVAC units
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM hvac_units ORDER BY id');
    res.json(result.rows);
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

export default router;
