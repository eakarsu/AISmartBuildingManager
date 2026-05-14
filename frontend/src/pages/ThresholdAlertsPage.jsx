import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Bell, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiGet, apiPost } from '../api.js'

export default function ThresholdAlertsPage() {
  const [hvacUnits, setHvacUnits] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(null)
  const [thresholds, setThresholds] = useState({ max_temp: 28, min_temp: 18, min_efficiency: 70, max_energy_kwh: 100 })

  useEffect(() => {
    apiGet('/hvac').then((data) => {
      setHvacUnits(data.data || data || [])
    }).catch(() => toast.error('Failed to load HVAC units'))
  }, [])

  const checkUnit = async (unit) => {
    setChecking(unit.id)
    try {
      const result = await apiPost(`/hvac/${unit.id}/check-thresholds`, thresholds)
      setResults((prev) => ({ ...prev, [unit.id]: result }))
    } catch (err) {
      toast.error('Check failed: ' + err.message)
    } finally {
      setChecking(null)
    }
  }

  const checkAll = async () => {
    setLoading(true)
    for (const unit of hvacUnits) {
      try {
        const result = await apiPost(`/hvac/${unit.id}/check-thresholds`, thresholds)
        setResults((prev) => ({ ...prev, [unit.id]: result }))
      } catch (_) {}
    }
    setLoading(false)
    toast.success('Threshold check complete')
  }

  const getStatusColor = (status) => {
    if (status === 'critical') return 'border-red-500/50 bg-red-500/5'
    if (status === 'warning') return 'border-yellow-500/50 bg-yellow-500/5'
    return 'border-green-500/50 bg-green-500/5'
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            Threshold Alerts
          </h1>
          <p className="text-dark-400 mt-1">Check HVAC unit readings against configured limits</p>
        </div>

        {/* Threshold Config */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Alert Thresholds</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'max_temp', label: 'Max Temp (°C)' },
              { key: 'min_temp', label: 'Min Temp (°C)' },
              { key: 'min_efficiency', label: 'Min Efficiency (%)' },
              { key: 'max_energy_kwh', label: 'Max Energy (kWh)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-dark-400 text-xs block mb-1">{label}</label>
                <input
                  type="number"
                  value={thresholds[key]}
                  onChange={(e) => setThresholds((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            ))}
          </div>
          <button
            onClick={checkAll}
            disabled={loading || hvacUnits.length === 0}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking All...' : 'Check All Units'}
          </button>
        </div>

        {/* Units grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hvacUnits.map((unit) => {
            const result = results[unit.id]
            return (
              <div key={unit.id} className={`bg-dark-800 border rounded-xl p-5 ${result ? getStatusColor(result.status) : 'border-dark-700'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{unit.name}</h3>
                    <p className="text-dark-400 text-sm">Zone: {unit.zone} | Floor: {unit.floor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      result.status === 'ok'
                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                        : <AlertTriangle className={`w-5 h-5 ${result.status === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                    )}
                    <button
                      onClick={() => checkUnit(unit)}
                      disabled={checking === unit.id}
                      className="text-xs px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg"
                    >
                      {checking === unit.id ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Temp</p>
                    <p className="text-white font-medium">{unit.current_temp}°C</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Efficiency</p>
                    <p className="text-white font-medium">{unit.efficiency}%</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Energy</p>
                    <p className="text-white font-medium">{unit.energy_kwh} kWh</p>
                  </div>
                </div>

                {result?.alerts?.length > 0 && (
                  <div className="space-y-1.5">
                    {result.alerts.map((alert, i) => (
                      <div key={i} className={`text-xs px-3 py-1.5 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {alert.message}
                      </div>
                    ))}
                  </div>
                )}
                {result?.status === 'ok' && (
                  <p className="text-green-400 text-xs">All readings within normal limits</p>
                )}
              </div>
            )
          })}
        </div>

        {hvacUnits.length === 0 && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No HVAC units found</p>
          </div>
        )}
      </main>
    </div>
  )
}
