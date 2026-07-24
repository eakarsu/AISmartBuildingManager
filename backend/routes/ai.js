import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import fetch from 'node-fetch';
import pool from '../db.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseAIJson(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) {}
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

async function persistAIResult(userId, endpoint, inputData, result) {
  await pool.query(
    `INSERT INTO ai_results (user_id, endpoint, input_data, result, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [userId || null, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
  );
}

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const baseUrl = String(process.env.OPENROUTER_BASE_URL || '').replace(/\/$/, '');
  if (!apiKey || !model || !baseUrl) throw Object.assign(new Error('OpenRouter runtime configuration is required'), { status: 503 });
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Smart Building Manager',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter request failed with HTTP ${response.status}`);
  }
  const data = await response.json();
  const content = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!content) throw new Error('OpenRouter returned empty content');
  data.choices[0].message.content = content;
  return data;
}

function validate(rules) {
  return [...rules, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    next();
  }];
}

// ─── POST /api/ai/building-health ───────────────────────────────────────────
// Cross-domain building health analysis
router.post('/building-health', aiRateLimiter, async (req, res, next) => {
  try {
    // Query HVAC, energy, and maintenance in parallel
    const [hvacResult, energyResult, maintenanceResult] = await Promise.all([
      pool.query('SELECT * FROM hvac_units ORDER BY id LIMIT 20'),
      pool.query('SELECT * FROM energy_records ORDER BY id LIMIT 20'),
      pool.query('SELECT * FROM maintenance_items ORDER BY id LIMIT 20'),
    ]);

    const hvac = hvacResult.rows;
    const energy = energyResult.rows;
    const maintenance = maintenanceResult.rows;

    const systemPrompt = `You are an expert building health analyst. You analyze HVAC, energy, and maintenance data together to give a holistic view of building health.
    Respond with a JSON object with these fields:
    {
      "overall_health_score": <0-100>,
      "hvac_score": <0-100>,
      "energy_score": <0-100>,
      "maintenance_score": <0-100>,
      "critical_issues": ["list of urgent issues"],
      "recommendations": ["list of prioritized recommendations"],
      "summary": "executive summary paragraph",
      "estimated_savings_usd_monthly": <number>
    }`;

    const userMessage = `Analyze the building health with this data:

HVAC UNITS (${hvac.length} units):
${JSON.stringify(hvac, null, 2)}

ENERGY RECORDS (${energy.length} records):
${JSON.stringify(energy, null, 2)}

MAINTENANCE ITEMS (${maintenance.length} items):
${JSON.stringify(maintenance, null, 2)}

Provide comprehensive cross-domain health analysis and recommendations.`;

    const data = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = parseAIJson(rawContent) || { summary: rawContent };

    const responseData = {
      health: parsed,
      raw: rawContent,
      model: data.model,
      timestamp: new Date().toISOString(),
    };

    await persistAIResult(req.user?.id, 'building-health', { hvac_count: hvac.length, energy_count: energy.length, maintenance_count: maintenance.length }, responseData);
    res.json(responseData);
  } catch (err) { next(err); }
});

// ─── POST /api/ai/energy-optimize ───────────────────────────────────────────
router.post('/energy-optimize', aiRateLimiter, validate([
  body('zone').optional().isString(),
]), async (req, res, next) => {
  try {
    const { zone } = req.body;
    const query = zone
      ? 'SELECT * FROM energy_records WHERE zone = $1 ORDER BY date LIMIT 50'
      : 'SELECT * FROM energy_records ORDER BY date LIMIT 50';
    const params = zone ? [zone] : [];
    const result = await pool.query(query, params);
    const records = result.rows;

    const systemPrompt = `You are an energy optimization expert for commercial buildings. Analyze energy usage patterns and provide actionable optimization strategies.
    Respond in JSON:
    {
      "efficiency_score": <0-100>,
      "peak_usage_zones": ["zones with highest consumption"],
      "optimization_strategies": [{"strategy": "...", "estimated_savings_pct": <number>, "implementation_cost": "low|medium|high"}],
      "scheduling_recommendations": ["time-based recommendations"],
      "summary": "brief summary"
    }`;

    const data = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze and optimize energy usage:\n${JSON.stringify(records, null, 2)}` },
    ]);

    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = parseAIJson(rawContent) || { summary: rawContent };
    const responseData = { optimization: parsed, raw: rawContent, model: data.model };
    await persistAIResult(req.user?.id, 'energy-optimize', req.body, responseData);
    res.json(responseData);
  } catch (err) { next(err); }
});

// ─── GET /api/ai/results ────────────────────────────────────────────────────
// POST /api/ai/occupancy-optimization (HVAC/lighting based on occupancy)
router.post('/occupancy-optimization', aiRateLimiter, async (req, res, next) => {
  try {
    const [spaces, hvac, lighting] = await Promise.all([
      pool.query('SELECT * FROM spaces ORDER BY id LIMIT 50').catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM hvac_units ORDER BY id LIMIT 50').catch(() => ({ rows: [] })),
      pool.query('SELECT * FROM lighting_zones ORDER BY id LIMIT 50').catch(() => ({ rows: [] })),
    ]);
    const messages = [
      { role: 'system', content: 'You are a building-systems AI. Recommend HVAC + lighting setbacks/setpoints based on actual or expected occupancy. Respond ONLY in JSON.' },
      { role: 'user', content: `Spaces:\n${JSON.stringify(spaces.rows)}\n\nHVAC units:\n${JSON.stringify(hvac.rows)}\n\nLighting zones:\n${JSON.stringify(lighting.rows)}\n\nReturn JSON: {recommendations:[{zone_or_unit_id,system:"hvac|lighting",current_setpoint_or_state,recommended_setpoint_or_state,justification,expected_kwh_savings_per_day,comfort_impact:"none|minor|moderate"}], schedule_adjustments:[{zone,window,setpoint,reason}], expected_total_savings_pct, summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'occupancy-optimization', { spaceCount: spaces.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

// POST /api/ai/predictive-maintenance
router.post('/predictive-maintenance', aiRateLimiter, async (req, res, next) => {
  try {
    const items = await pool.query('SELECT * FROM maintenance_items ORDER BY id DESC LIMIT 100').catch(() => ({ rows: [] }));
    const hvac = await pool.query('SELECT id, name, status, last_serviced_at, runtime_hours FROM hvac_units').catch(() => ({ rows: [] }));
    const elevators = await pool.query('SELECT id, name, status, last_serviced_at FROM elevators').catch(() => ({ rows: [] }));
    const messages = [
      { role: 'system', content: 'You are a predictive-maintenance AI for building equipment. Predict failures and recommend PM. Respond ONLY in JSON.' },
      { role: 'user', content: `Maintenance items:\n${JSON.stringify(items.rows)}\n\nHVAC:\n${JSON.stringify(hvac.rows)}\n\nElevators:\n${JSON.stringify(elevators.rows)}\n\nReturn JSON: {predictions:[{equipment_id,equipment_type,predicted_failure_window:"7d|14d|30d|90d",failure_mode,probability:0-1,recommended_action,priority:"high|medium|low",parts_to_stage:[]}], pm_schedule:[{date,equipment,action,duration_min,techs_required}], cost_avoidance_estimate, summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'predictive-maintenance', { items: items.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

// POST /api/ai/security-anomaly-detection
router.post('/security-anomaly-detection', aiRateLimiter, async (req, res, next) => {
  try {
    const access = await pool.query('SELECT * FROM activity ORDER BY created_at DESC LIMIT 200').catch(() => ({ rows: [] }));
    const alerts = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100').catch(() => ({ rows: [] }));
    const messages = [
      { role: 'system', content: 'You are a building-security anomaly-detection AI. Identify unusual access, badge cloning, off-hours patterns, repeated denials. Respond ONLY in JSON.' },
      { role: 'user', content: `Recent activity:\n${JSON.stringify(access.rows)}\n\nRecent alerts:\n${JSON.stringify(alerts.rows)}\n\nReturn JSON: {anomalies:[{type:"off_hours|repeated_denial|tailgating|badge_clone|unusual_path|geo_velocity",severity:"low|medium|high|critical",entities:[{kind:"badge|user|door",id_or_label}],evidence,recommended_action}], baseline_notes, escalations:[{severity:"high|critical",notify:["security_team","facility_mgr","exec"]}], summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'security-anomaly-detection', { events: access.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

// POST /api/ai/energy-forecast — Apply pass 4 backlog
router.post('/energy-forecast', aiRateLimiter, async (req, res, next) => {
  try {
    const { horizon_days = 30 } = req.body || {};
    const records = await pool.query(
      'SELECT * FROM energy_records ORDER BY date DESC LIMIT 180'
    ).catch(() => ({ rows: [] }));
    const messages = [
      { role: 'system', content: 'You are a building-energy forecasting AI. Forecast usage and peak demand. Respond ONLY in JSON.' },
      { role: 'user', content: `Historical records:\n${JSON.stringify(records.rows)}\n\nHorizon days: ${horizon_days}\n\nReturn JSON: {forecast:[{date,expected_kwh,expected_peak_kw,confidence}], peak_periods:[{window,expected_peak_kw,reason}], cost_estimate_usd, drivers:[], summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'energy-forecast', { horizon_days, history_count: records.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

// POST /api/ai/comfort-optimization — Apply pass 4 backlog
router.post('/comfort-optimization', aiRateLimiter, async (req, res, next) => {
  try {
    const climate = await pool.query('SELECT * FROM climate_readings ORDER BY recorded_at DESC LIMIT 100').catch(() => ({ rows: [] }));
    const comfort = await pool.query('SELECT * FROM comfort_feedback ORDER BY created_at DESC LIMIT 100').catch(() => ({ rows: [] }));
    const hvac = await pool.query('SELECT id, name, status, setpoint_temperature FROM hvac_units').catch(() => ({ rows: [] }));
    const messages = [
      { role: 'system', content: 'You are a thermal-comfort optimization AI. Recommend HVAC setpoint and humidity adjustments to improve occupant comfort. Respond ONLY in JSON.' },
      { role: 'user', content: `Climate readings:\n${JSON.stringify(climate.rows)}\n\nFeedback:\n${JSON.stringify(comfort.rows)}\n\nHVAC:\n${JSON.stringify(hvac.rows)}\n\nReturn JSON: {recommendations:[{zone_or_unit_id,current_setpoint,recommended_setpoint,humidity_target,justification,comfort_uplift:"none|minor|moderate|major"}], hot_spots:[], cold_spots:[], summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'comfort-optimization', { climate_count: climate.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

// POST /api/ai/water-usage-optimization — Apply pass 4 backlog
router.post('/water-usage-optimization', aiRateLimiter, async (req, res, next) => {
  try {
    const water = await pool.query('SELECT * FROM water_records ORDER BY recorded_at DESC LIMIT 100').catch(() => ({ rows: [] }));
    const messages = [
      { role: 'system', content: 'You are a building water-efficiency AI. Identify leaks, overuse, and recommend conservation. Respond ONLY in JSON.' },
      { role: 'user', content: `Water records:\n${JSON.stringify(water.rows)}\n\nReturn JSON: {anomalies:[{location,type:"leak|overuse|spike|equipment_failure",severity:"low|medium|high",evidence,recommended_action}], conservation_strategies:[{strategy,estimated_savings_pct,implementation_cost:"low|medium|high"}], expected_savings_usd_monthly, summary}.` }
    ];
    const ai = await callOpenRouter(messages);
    const content = ai.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistAIResult(req.user?.id, 'water-usage-optimization', { records: water.rows.length }, parsed);
    res.json(parsed);
  } catch (err) { next(err); }
});

router.get('/results', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      'SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_results WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

export default router;
