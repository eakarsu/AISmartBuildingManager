import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Maintenance item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO maintenance_items (equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes } = req.body;
    const result = await pool.query(
      `UPDATE maintenance_items SET equipment_name=$1, equipment_type=$2, location=$3, status=$4, priority=$5, health_score=$6, predicted_failure_date=$7, last_service=$8, next_service=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [equipment_name, equipment_type, location, status, priority, health_score, predicted_failure_date, last_service, next_service, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Maintenance item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_items WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Maintenance item not found' });
    res.json({ message: 'Maintenance item deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_items WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Maintenance item not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze equipment health data and predict maintenance needs. Provide a predictive maintenance schedule.' },
          { role: 'user', content: `Analyze this maintenance item data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
