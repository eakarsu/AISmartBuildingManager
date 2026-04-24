import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all waste records
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM waste_records ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single waste record
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM waste_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new waste record
router.post('/', async (req, res, next) => {
  try {
    const { container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status } = req.body;
    const result = await pool.query(
      `INSERT INTO waste_records (container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update waste record
router.put('/:id', async (req, res, next) => {
  try {
    const { container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status } = req.body;
    const result = await pool.query(
      `UPDATE waste_records SET container_name=$1, location=$2, floor=$3, waste_type=$4, capacity_liters=$5, fill_level=$6, last_collected=$7, next_collection=$8, daily_avg_kg=$9, contamination_rate=$10, status=$11
       WHERE id=$12 RETURNING *`,
      [container_name, location, floor, waste_type, capacity_liters, fill_level, last_collected, next_collection, daily_avg_kg, contamination_rate, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete waste record
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM waste_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    res.json({ message: 'Waste record deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM waste_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Waste record not found' });
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
          { role: 'system', content: 'You are an AI waste management expert. Analyze waste data and provide recommendations for recycling improvement, collection scheduling, and sustainability.' },
          { role: 'user', content: `Analyze this waste record data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
