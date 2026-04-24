import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET / - list all activity logs with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, action, resource_type } = req.query;
    let query = 'SELECT * FROM activity_log WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }

    if (resource_type) {
      query += ` AND resource_type = $${paramIndex++}`;
      params.push(resource_type);
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM activity_log WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (action) {
      countQuery += ` AND action = $${countIndex++}`;
      countParams.push(action);
    }

    if (resource_type) {
      countQuery += ` AND resource_type = $${countIndex++}`;
      countParams.push(resource_type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({ data: result.rows, total, limit: Number(limit), offset: Number(offset) });
  } catch (err) {
    next(err);
  }
});

// GET /stats - activity counts grouped by action and resource_type
router.get('/stats', async (req, res, next) => {
  try {
    const byAction = await pool.query(
      'SELECT action, COUNT(*)::int AS count FROM activity_log GROUP BY action ORDER BY count DESC'
    );
    const byResource = await pool.query(
      'SELECT resource_type, COUNT(*)::int AS count FROM activity_log GROUP BY resource_type ORDER BY count DESC'
    );
    res.json({
      by_action: byAction.rows,
      by_resource_type: byResource.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST / - create new activity log entry
router.post('/', async (req, res, next) => {
  try {
    const { user_name, user_email, action, resource_type, resource_id, description, ip_address } = req.body;
    const result = await pool.query(
      `INSERT INTO activity_log (user_name, user_email, action, resource_type, resource_id, description, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_name, user_email, action, resource_type, resource_id || null, description, ip_address || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - delete a log entry
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM activity_log WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity log entry not found' });
    }
    res.json({ message: 'Activity log entry deleted', item: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
