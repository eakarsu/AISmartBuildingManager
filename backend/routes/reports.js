import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /overview - Aggregated building stats
router.get('/overview', async (req, res, next) => {
  try {
    const [
      hvacResult,
      energyResult,
      securityResult,
      comfortResult,
      waterResult,
      parkingResult,
      maintenanceResult,
      spaceResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, AVG(efficiency) as avg_efficiency FROM hvac_units'),
      pool.query('SELECT SUM(consumption_kwh) as total_kwh, SUM(cost) as total_cost FROM energy_records'),
      pool.query("SELECT COUNT(*) as active_events FROM security_events WHERE status != 'resolved'"),
      pool.query('SELECT AVG(overall_score) as avg_comfort FROM comfort_scores'),
      pool.query('SELECT SUM(daily_usage) as total_water FROM water_systems'),
      pool.query('SELECT SUM(total_spots) as total_spots, SUM(occupied_spots) as occupied_spots FROM parking_zones'),
      pool.query('SELECT priority, COUNT(*) as count FROM maintenance_items GROUP BY priority'),
      pool.query('SELECT AVG(utilization_rate) as avg_utilization FROM space_utilization'),
    ]);

    const maintenanceByPriority = {};
    maintenanceResult.rows.forEach(row => {
      maintenanceByPriority[row.priority] = parseInt(row.count, 10);
    });

    res.json({
      hvac: {
        total_units: parseInt(hvacResult.rows[0].total, 10),
        avg_efficiency: parseFloat(hvacResult.rows[0].avg_efficiency) || 0,
      },
      energy: {
        total_kwh: parseFloat(energyResult.rows[0].total_kwh) || 0,
        total_cost: parseFloat(energyResult.rows[0].total_cost) || 0,
      },
      security: {
        active_events: parseInt(securityResult.rows[0].active_events, 10),
      },
      comfort: {
        avg_score: parseFloat(comfortResult.rows[0].avg_comfort) || 0,
      },
      water: {
        total_usage: parseFloat(waterResult.rows[0].total_water) || 0,
      },
      parking: {
        total_spots: parseInt(parkingResult.rows[0].total_spots, 10) || 0,
        occupied_spots: parseInt(parkingResult.rows[0].occupied_spots, 10) || 0,
      },
      maintenance: maintenanceByPriority,
      space: {
        avg_utilization: parseFloat(spaceResult.rows[0].avg_utilization) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /energy-breakdown - Energy consumption grouped by source
router.get('/energy-breakdown', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT source, SUM(consumption_kwh) as total_kwh, SUM(cost) as total_cost, AVG(efficiency_rating) as avg_efficiency
       FROM energy_records GROUP BY source`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /system-status - Status counts for each system
router.get('/system-status', async (req, res, next) => {
  try {
    const [hvac, lighting, climate, water, fire, elevator] = await Promise.all([
      pool.query('SELECT status, COUNT(*) as count FROM hvac_units GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM lighting_zones GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM climate_zones GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM water_systems GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM fire_safety_systems GROUP BY status'),
      pool.query('SELECT status, COUNT(*) as count FROM elevator_systems GROUP BY status'),
    ]);

    const toStatusMap = (rows) => {
      const map = {};
      rows.forEach(row => {
        map[row.status] = parseInt(row.count, 10);
      });
      return map;
    };

    res.json({
      hvac: toStatusMap(hvac.rows),
      lighting: toStatusMap(lighting.rows),
      climate: toStatusMap(climate.rows),
      water: toStatusMap(water.rows),
      fire_safety: toStatusMap(fire.rows),
      elevators: toStatusMap(elevator.rows),
    });
  } catch (err) {
    next(err);
  }
});

// GET /floor-summary - Data grouped by floor
router.get('/floor-summary', async (req, res, next) => {
  try {
    const [spaceResult, comfortResult] = await Promise.all([
      pool.query(
        `SELECT floor, SUM(current_occupancy) as total_occupancy, AVG(utilization_rate) as avg_utilization
         FROM space_utilization GROUP BY floor ORDER BY floor`
      ),
      pool.query(
        `SELECT floor, AVG(overall_score) as avg_comfort
         FROM comfort_scores GROUP BY floor ORDER BY floor`
      ),
    ]);

    // Merge floor data
    const floorMap = {};

    spaceResult.rows.forEach(row => {
      const floor = row.floor;
      if (!floorMap[floor]) floorMap[floor] = { floor };
      floorMap[floor].total_occupancy = parseInt(row.total_occupancy, 10) || 0;
      floorMap[floor].avg_utilization = parseFloat(row.avg_utilization) || 0;
    });

    comfortResult.rows.forEach(row => {
      const floor = row.floor;
      if (!floorMap[floor]) floorMap[floor] = { floor };
      floorMap[floor].avg_comfort = parseFloat(row.avg_comfort) || 0;
    });

    const floors = Object.values(floorMap).sort((a, b) => {
      if (typeof a.floor === 'number' && typeof b.floor === 'number') return a.floor - b.floor;
      return String(a.floor).localeCompare(String(b.floor));
    });

    res.json(floors);
  } catch (err) {
    next(err);
  }
});

export default router;
