import React, { useState, useEffect } from 'react'
import { Zap, Loader2, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { apiGet } from '../api'

export default function EnergyConsumptionChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = async () => {
    try {
      setLoading(true); setErr(null)
      const r = await apiGet('/custom-views/energy-chart')
      setData(r)
    } catch (e) { setErr(String(e.message || e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-700 flex items-center gap-3 text-dark-300">
      <Loader2 className="animate-spin" size={18} /> Loading energy chart...
    </div>
  )
  if (err) return <div className="p-6 bg-red-900/20 border border-red-700 rounded-xl text-red-300">Error: {err}</div>

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6" data-testid="energy-consumption-chart">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Energy Consumption</h3>
        </div>
        <button onClick={load} className="text-dark-300 hover:text-white p-1.5 rounded">
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Today</div>
          <div className="text-xl font-bold text-white">{data.totals.today_kwh.toLocaleString()} <span className="text-sm text-dark-400">kWh</span></div>
        </div>
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Solar Today</div>
          <div className="text-xl font-bold text-green-400">{data.totals.solar_today_kwh.toLocaleString()}</div>
        </div>
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Week Total</div>
          <div className="text-xl font-bold text-blue-400">{data.totals.week_kwh.toLocaleString()}</div>
        </div>
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">CO2 (kg)</div>
          <div className="text-xl font-bold text-orange-400">{data.totals.grid_carbon_kg.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={data.hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={2} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend />
            <Area type="monotone" dataKey="consumption_kwh" name="Grid kWh" stroke="#3b82f6" fill="#3b82f680" />
            <Area type="monotone" dataKey="solar_kwh" name="Solar kWh" stroke="#22c55e" fill="#22c55e80" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6" style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="hvac_kwh" name="HVAC" stackId="a" fill="#3b82f6" />
            <Bar dataKey="lighting_kwh" name="Lighting" stackId="a" fill="#facc15" />
            <Bar dataKey="equipment_kwh" name="Equipment" stackId="a" fill="#a855f7" />
            <Bar dataKey="other_kwh" name="Other" stackId="a" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
