import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all visitor logs
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_logs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single visitor log
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new visitor log
router.post('/', async (req, res, next) => {
  try {
    const { visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO visitor_logs (visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update visitor log
router.put('/:id', async (req, res, next) => {
  try {
    const { visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes } = req.body;
    const result = await pool.query(
      `UPDATE visitor_logs SET visitor_name=$1, company=$2, host_name=$3, host_floor=$4, purpose=$5, badge_number=$6, check_in=$7, check_out=$8, status=$9, id_verified=$10, notes=$11
       WHERE id=$12 RETURNING *`,
      [visitor_name, company, host_name, host_floor, purpose, badge_number, check_in, check_out, status, id_verified, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete visitor log
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM visitor_logs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
    }
    res.json({ message: 'Visitor log deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_logs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visitor log not found' });
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
          { role: 'system', content: 'You are an AI building visitor management expert. Analyze visitor log data and provide recommendations for security, flow optimization, and access management.' },
          { role: 'user', content: `Analyze this visitor log data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
