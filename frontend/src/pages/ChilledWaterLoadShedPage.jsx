import React, { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const emptyForm = { plant: '', chiller: '', shedKw: 0, tenantImpact: '', window: '', status: 'ready' };

export default function ChilledWaterLoadShedPage() {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ total: 0, shedKw: 0, blocked: 0 });
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await api.get('/chilled-water-load-shed');
    setEvents(res.data.events || []);
    setSummary(res.data.summary || { total: 0, shedKw: 0, blocked: 0 });
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/chilled-water-load-shed', form);
    setForm(emptyForm);
    load();
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Droplets className="text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Chilled Water Load Shed</h1>
            <p className="text-dark-400">Demand-response readiness by chiller, plant, and tenant impact.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['total', 'shedKw', 'blocked'].map(key => <div key={key} className="bg-dark-800 border border-dark-700 rounded-xl p-4"><p className="text-dark-400 text-sm">{key}</p><p className="text-2xl font-bold text-white">{summary[key]}</p></div>)}
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-dark-800 border border-dark-700 rounded-xl p-4 mb-6">
          {['plant', 'chiller', 'tenantImpact', 'window'].map(field => <input key={field} className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white" placeholder={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />)}
          <input className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white" type="number" value={form.shedKw} onChange={e => setForm({ ...form, shedKw: e.target.value })} />
          <select className="bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-white" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>ready</option><option>blocked</option><option>testing</option></select>
          <button className="bg-primary-600 rounded-lg px-4 py-2 text-white font-semibold">Add Event</button>
        </form>
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-900 text-dark-300"><tr>{['Plant', 'Chiller', 'Shed kW', 'Tenant Impact', 'Window', 'Status'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{events.map(row => <tr key={row.id} className="border-t border-dark-700"><td className="p-3">{row.plant}</td><td>{row.chiller}</td><td>{row.shedKw}</td><td>{row.tenantImpact}</td><td>{row.window}</td><td>{row.status}</td></tr>)}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
