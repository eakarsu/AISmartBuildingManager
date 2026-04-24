import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all elevator systems
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM elevator_systems ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single elevator system
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM elevator_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elevator system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new elevator system
router.post('/', async (req, res, next) => {
  try {
    const { elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption } = req.body;
    const result = await pool.query(
      `INSERT INTO elevator_systems (elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update elevator system
router.put('/:id', async (req, res, next) => {
  try {
    const { elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption } = req.body;
    const result = await pool.query(
      `UPDATE elevator_systems SET elevator_name=$1, elevator_type=$2, serving_floors=$3, current_floor=$4, status=$5, daily_trips=$6, avg_wait_time=$7, capacity_kg=$8, last_maintenance=$9, next_maintenance=$10, health_score=$11, energy_consumption=$12
       WHERE id=$13 RETURNING *`,
      [elevator_name, elevator_type, serving_floors, current_floor, status, daily_trips, avg_wait_time, capacity_kg, last_maintenance, next_maintenance, health_score, energy_consumption, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elevator system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete elevator system
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM elevator_systems WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elevator system not found' });
    }
    res.json({ message: 'Elevator system deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM elevator_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elevator system not found' });
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
          { role: 'system', content: 'You are an AI elevator management expert. Analyze elevator system data and provide recommendations for maintenance scheduling, traffic optimization, and energy efficiency.' },
          { role: 'user', content: `Analyze this elevator system data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
