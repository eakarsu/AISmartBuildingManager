import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM security_events ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM security_events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Security event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      `INSERT INTO security_events (event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at } = req.body;
    const result = await pool.query(
      `UPDATE security_events SET event_type=$1, location=$2, floor=$3, severity=$4, status=$5, camera_id=$6, description=$7, reported_at=$8, resolved_at=$9
       WHERE id=$10 RETURNING *`,
      [event_type, location, floor, severity, status, camera_id, description, reported_at, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Security event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM security_events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Security event not found' });
    res.json({ message: 'Security event deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM security_events WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Security event not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze security event patterns and recommend safety improvements.' },
          { role: 'user', content: `Analyze this security event data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
