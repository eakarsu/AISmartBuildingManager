import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM space_utilization ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM space_utilization WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Space record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status } = req.body;
    const result = await pool.query(
      `INSERT INTO space_utilization (space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status } = req.body;
    const result = await pool.query(
      `UPDATE space_utilization SET space_name=$1, floor=$2, zone=$3, space_type=$4, capacity=$5, current_occupancy=$6, utilization_rate=$7, peak_hour=$8, avg_daily_usage=$9, status=$10
       WHERE id=$11 RETURNING *`,
      [space_name, floor, zone, space_type, capacity, current_occupancy, utilization_rate, peak_hour, avg_daily_usage, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Space record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM space_utilization WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Space record not found' });
    res.json({ message: 'Space record deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM space_utilization WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Space record not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze space utilization patterns and recommend optimization strategies.' },
          { role: 'user', content: `Analyze this space utilization data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
