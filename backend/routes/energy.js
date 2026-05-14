import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const result = await pool.query('SELECT * FROM energy_records ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
    const countResult = await pool.query('SELECT COUNT(*) FROM energy_records');
    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM energy_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Energy record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint } = req.body;
    const result = await pool.query(
      `INSERT INTO energy_records (source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint } = req.body;
    const result = await pool.query(
      `UPDATE energy_records SET source=$1, zone=$2, consumption_kwh=$3, cost=$4, date=$5, peak_hours=$6, efficiency_rating=$7, carbon_footprint=$8
       WHERE id=$9 RETURNING *`,
      [source, zone, consumption_kwh, cost, date, peak_hours, efficiency_rating, carbon_footprint, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Energy record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM energy_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Energy record not found' });
    res.json({ message: 'Energy record deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM energy_records WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Energy record not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze energy consumption patterns and recommend cost-reduction strategies.' },
          { role: 'user', content: `Analyze this energy record data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
