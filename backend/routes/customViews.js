import { Router } from 'express';
import PDFDocument from 'pdfkit';
import rateLimit from 'express-rate-limit';
import pool from '../db.js';

const router = Router();

// Resolve ipKeyGenerator helper if available (newer express-rate-limit versions)
let ipKeyGenerator;
try {
  const mod = await import('express-rate-limit');
  ipKeyGenerator = mod.ipKeyGenerator || mod.default?.ipKeyGenerator;
} catch (_) {}

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  ...(ipKeyGenerator ? { keyGenerator: (req, res) => ipKeyGenerator(req, res) } : {}),
});

router.use(limiter);

// Ensure HVAC schedules table for rules editor (NON-VIZ #2 CRUD)
async function ensureSchedulesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hvac_schedules (
        id SERIAL PRIMARY KEY,
        zone_name VARCHAR(120) NOT NULL,
        day_of_week VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        target_temp NUMERIC(5,2) NOT NULL,
        mode VARCHAR(40) NOT NULL DEFAULT 'auto',
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    const r = await pool.query('SELECT COUNT(*)::int AS c FROM hvac_schedules');
    if (r.rows[0].c === 0) {
      await pool.query(`
        INSERT INTO hvac_schedules (zone_name, day_of_week, start_time, end_time, target_temp, mode, enabled) VALUES
        ('Lobby', 'Mon-Fri', '07:00', '19:00', 22.0, 'cool', true),
        ('Conference Rooms', 'Mon-Fri', '08:00', '18:00', 21.5, 'auto', true),
        ('Server Room', 'All', '00:00', '23:59', 18.0, 'cool', true),
        ('Cafeteria', 'Mon-Fri', '11:00', '15:00', 22.5, 'cool', true),
        ('Executive Offices', 'Mon-Fri', '08:30', '18:30', 22.0, 'auto', true),
        ('Parking Garage', 'All', '06:00', '22:00', 24.0, 'fan', false)
      `);
    }
  } catch (e) {
    // table may already exist
  }
}
ensureSchedulesTable();

// --- VIZ #1: Energy consumption chart data (hourly + daily breakdown) ---
router.get('/energy-chart', async (req, res, next) => {
  try {
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const base = 320;
      const peak = h >= 9 && h <= 18 ? 220 : 60;
      const variance = Math.round(Math.sin((h / 24) * Math.PI * 2) * 40);
      return {
        hour: `${String(h).padStart(2, '0')}:00`,
        consumption_kwh: base + peak + variance + Math.round(Math.random() * 25),
        solar_kwh: h >= 7 && h <= 19 ? Math.round(Math.sin(((h - 7) / 12) * Math.PI) * 180) : 0,
      };
    });
    const daily = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      day: d,
      hvac_kwh: 2400 + Math.round(Math.random() * 600),
      lighting_kwh: 800 + Math.round(Math.random() * 200),
      equipment_kwh: 1200 + Math.round(Math.random() * 400),
      other_kwh: 400 + Math.round(Math.random() * 150),
    }));
    const totals = {
      today_kwh: hourly.reduce((s, x) => s + x.consumption_kwh, 0),
      solar_today_kwh: hourly.reduce((s, x) => s + x.solar_kwh, 0),
      week_kwh: daily.reduce((s, x) => s + x.hvac_kwh + x.lighting_kwh + x.equipment_kwh + x.other_kwh, 0),
      grid_carbon_kg: Math.round(hourly.reduce((s, x) => s + x.consumption_kwh, 0) * 0.42),
    };
    res.json({ hourly, daily, totals, generated_at: new Date().toISOString() });
  } catch (err) { next(err); }
});

// --- VIZ #2: Zone occupancy heatmap (floors x zones grid) ---
router.get('/occupancy-heatmap', async (req, res, next) => {
  try {
    const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];
    const zones = ['North', 'South', 'East', 'West', 'Central'];
    const cells = [];
    floors.forEach((floor, fi) => {
      zones.forEach((zone, zi) => {
        const capacity = 40 + ((fi + zi) % 3) * 15;
        const occupied = Math.round(capacity * (0.25 + Math.random() * 0.7));
        cells.push({
          floor,
          zone,
          capacity,
          occupied,
          utilization: Math.min(1, occupied / capacity),
          temp_c: +(20 + Math.random() * 4).toFixed(1),
        });
      });
    });
    const summary = {
      total_capacity: cells.reduce((s, c) => s + c.capacity, 0),
      total_occupied: cells.reduce((s, c) => s + c.occupied, 0),
      avg_utilization: +(cells.reduce((s, c) => s + c.utilization, 0) / cells.length).toFixed(2),
      peak_zone: cells.reduce((m, c) => (c.utilization > m.utilization ? c : m), cells[0]),
    };
    res.json({ floors, zones, cells, summary, generated_at: new Date().toISOString() });
  } catch (err) { next(err); }
});

// --- NON-VIZ #1: Facility operations PDF ---
router.get('/operations-pdf', async (req, res, next) => {
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="facility-operations-report.pdf"');
    doc.pipe(res);

    doc.fontSize(22).fillColor('#1e40af').text('Facility Operations Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#475569').text(
      `Generated ${new Date().toLocaleString()} - AI Smart Building Manager`,
      { align: 'center' }
    );
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#0f172a').text('Executive Summary');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e1').stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#334155').text(
      'Building is operating within normal parameters. HVAC efficiency 92%, lighting savings up 8% week-over-week, no critical safety incidents in the past 7 days.'
    );
    doc.moveDown(1);

    const kpis = [
      ['Total Energy (week)', '38,420 kWh'],
      ['Average Occupancy', '67%'],
      ['Open Maintenance Tickets', '12'],
      ['Critical Alerts (24h)', '0'],
      ['Water Usage', '14,200 gal'],
      ['Carbon Footprint', '16,140 kg CO2'],
    ];
    doc.fontSize(14).fillColor('#0f172a').text('Key Performance Indicators');
    doc.moveDown(0.4);
    kpis.forEach(([k, v]) => {
      doc.fontSize(11).fillColor('#475569').text(`${k}:`, { continued: true })
         .fillColor('#0f172a').text(`  ${v}`);
    });
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#0f172a').text('Scheduled Maintenance (Next 14 Days)');
    doc.moveDown(0.4);
    const tasks = [
      'HVAC Unit 3 - Filter replacement (May 22)',
      'Elevator Bank A - Quarterly inspection (May 24)',
      'Fire suppression system - Pressure test (May 27)',
      'Cooling tower - Water treatment (May 29)',
      'Backup generator - Load test (Jun 02)',
    ];
    tasks.forEach((t, i) => {
      doc.fontSize(11).fillColor('#334155').text(`${i + 1}. ${t}`);
    });
    doc.moveDown(1);

    doc.fontSize(14).fillColor('#0f172a').text('Recommendations');
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor('#334155').list([
      'Reduce after-hours HVAC setpoint by 1C for projected 4% savings.',
      'Re-balance Floor 4 zones - West zone consistently over-cooled.',
      'Schedule Q3 BMS firmware update.',
      'Audit lighting sensors in low-traffic corridors.',
    ]);

    doc.end();
  } catch (err) { next(err); }
});

// --- NON-VIZ #2: Building automation rules editor (CRUD HVAC schedules) ---
router.get('/hvac-schedules', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT * FROM hvac_schedules ORDER BY id ASC');
    res.json({ schedules: r.rows, count: r.rows.length });
  } catch (err) { next(err); }
});

router.post('/hvac-schedules', async (req, res, next) => {
  try {
    const { zone_name, day_of_week, start_time, end_time, target_temp, mode = 'auto', enabled = true } = req.body || {};
    if (!zone_name || !day_of_week || !start_time || !end_time || target_temp == null) {
      return res.status(400).json({ error: 'zone_name, day_of_week, start_time, end_time, target_temp required' });
    }
    const r = await pool.query(
      `INSERT INTO hvac_schedules (zone_name, day_of_week, start_time, end_time, target_temp, mode, enabled)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [zone_name, day_of_week, start_time, end_time, target_temp, mode, enabled]
    );
    res.status(201).json({ schedule: r.rows[0] });
  } catch (err) { next(err); }
});

router.put('/hvac-schedules/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { zone_name, day_of_week, start_time, end_time, target_temp, mode, enabled } = req.body || {};
    const r = await pool.query(
      `UPDATE hvac_schedules
       SET zone_name=COALESCE($1, zone_name),
           day_of_week=COALESCE($2, day_of_week),
           start_time=COALESCE($3, start_time),
           end_time=COALESCE($4, end_time),
           target_temp=COALESCE($5, target_temp),
           mode=COALESCE($6, mode),
           enabled=COALESCE($7, enabled),
           updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [zone_name, day_of_week, start_time, end_time, target_temp, mode, enabled, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ schedule: r.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/hvac-schedules/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await pool.query('DELETE FROM hvac_schedules WHERE id=$1 RETURNING id', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: r.rows[0].id });
  } catch (err) { next(err); }
});

export default router;
