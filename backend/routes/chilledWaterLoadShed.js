import { Router } from 'express';

const router = Router();

let events = [
  { id: 1, plant: 'Central Plant A', chiller: 'CH-2', shedKw: 420, tenantImpact: 'Conference wing pre-cool active', window: '14:00-16:00', status: 'ready' },
  { id: 2, plant: 'Tower East', chiller: 'CH-5', shedKw: 260, tenantImpact: 'Lab humidity constraint', window: '15:30-17:00', status: 'blocked' },
  { id: 3, plant: 'Annex Plant', chiller: 'CH-1', shedKw: 180, tenantImpact: 'No occupant override', window: '13:00-15:00', status: 'ready' }
];

router.get('/', (req, res) => {
  const summary = events.reduce((acc, row) => {
    acc.total += 1;
    acc.shedKw += Number(row.shedKw || 0);
    acc.blocked += row.status === 'blocked' ? 1 : 0;
    return acc;
  }, { total: 0, shedKw: 0, blocked: 0 });
  res.json({ events, summary });
});

router.post('/', (req, res) => {
  const item = {
    id: Date.now(),
    plant: req.body.plant || 'Unassigned plant',
    chiller: req.body.chiller || 'CH-TBD',
    shedKw: Number(req.body.shedKw || 0),
    tenantImpact: req.body.tenantImpact || 'Impact review pending',
    window: req.body.window || 'TBD',
    status: req.body.status || 'ready'
  };
  events = [item, ...events];
  res.status(201).json(item);
});

export default router;
