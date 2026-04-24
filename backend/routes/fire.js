import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

// GET / - list all fire safety systems
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM fire_safety_systems ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single fire safety system
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM fire_safety_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fire safety system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new fire safety system
router.post('/', async (req, res, next) => {
  try {
    const { system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO fire_safety_systems (system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update fire safety system
router.put('/:id', async (req, res, next) => {
  try {
    const { system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes } = req.body;
    const result = await pool.query(
      `UPDATE fire_safety_systems SET system_name=$1, system_type=$2, location=$3, floor=$4, status=$5, last_tested=$6, next_test=$7, battery_level=$8, compliance_status=$9, zone_coverage=$10, notes=$11
       WHERE id=$12 RETURNING *`,
      [system_name, system_type, location, floor, status, last_tested, next_test, battery_level, compliance_status, zone_coverage, notes, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fire safety system not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete fire safety system
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM fire_safety_systems WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fire safety system not found' });
    }
    res.json({ message: 'Fire safety system deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /:id/analyze - AI analysis
router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM fire_safety_systems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fire safety system not found' });
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
          { role: 'system', content: 'You are an AI fire safety expert. Analyze fire safety system data and provide recommendations for compliance, maintenance scheduling, and emergency preparedness.' },
          { role: 'user', content: `Analyze this fire safety system data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
