import { Router } from 'express';
import fetch from 'node-fetch';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM comfort_scores ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM comfort_scores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comfort score not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date } = req.body;
    const result = await pool.query(
      `INSERT INTO comfort_scores (tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date } = req.body;
    const result = await pool.query(
      `UPDATE comfort_scores SET tenant_name=$1, unit=$2, floor=$3, overall_score=$4, temperature_score=$5, air_quality_score=$6, lighting_score=$7, noise_score=$8, feedback=$9, survey_date=$10
       WHERE id=$11 RETURNING *`,
      [tenant_name, unit, floor, overall_score, temperature_score, air_quality_score, lighting_score, noise_score, feedback, survey_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comfort score not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM comfort_scores WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comfort score not found' });
    res.json({ message: 'Comfort score deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM comfort_scores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comfort score not found' });
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
          { role: 'system', content: 'You are an AI building management expert. Analyze tenant comfort scores and suggest improvements to increase satisfaction.' },
          { role: 'user', content: `Analyze this comfort score data and provide recommendations:\n${JSON.stringify(item, null, 2)}` },
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
