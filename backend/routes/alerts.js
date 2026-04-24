import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /summary/stats - must be before /:id to avoid route conflict
router.get('/summary/stats', async (req, res, next) => {
  try {
    const severityResult = await pool.query(
      `SELECT severity, COUNT(*)::int AS count FROM alerts GROUP BY severity`
    );
    const statusResult = await pool.query(
      `SELECT status, COUNT(*)::int AS count FROM alerts GROUP BY status`
    );
    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS count FROM alerts`
    );
    res.json({
      total: totalResult.rows[0].count,
      by_severity: severityResult.rows,
      by_status: statusResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET / - list all alerts
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single alert
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST / - create new alert
router.post('/', async (req, res, next) => {
  try {
    const { title, message, severity, source, location, floor, status } = req.body;
    const result = await pool.query(
      `INSERT INTO alerts (title, message, severity, source, location, floor, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, message, severity || 'info', source, location, floor, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update alert
router.put('/:id', async (req, res, next) => {
  try {
    const { title, message, severity, source, location, floor, status } = req.body;
    const result = await pool.query(
      `UPDATE alerts SET title=$1, message=$2, severity=$3, source=$4, location=$5, floor=$6, status=$7
       WHERE id=$8 RETURNING *`,
      [title, message, severity, source, location, floor, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/acknowledge - acknowledge alert
router.put('/:id/acknowledge', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE alerts SET status='acknowledged', acknowledged_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/resolve - resolve alert
router.put('/:id/resolve', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE alerts SET status='resolved', resolved_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete alert
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json({ message: 'Alert deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
