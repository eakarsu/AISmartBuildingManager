import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Users, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiPost } from '../api.js'

export default function OccupancyOptimizationPage() {
  const [zone, setZone] = useState('')
  const [targetOccupancy, setTargetOccupancy] = useState('')
  const [hours, setHours] = useState(24)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await apiPost('/ai/occupancy-optimization', {
        zone: zone || undefined,
        target_occupancy: targetOccupancy ? Number(targetOccupancy) : undefined,
        horizon_hours: Number(hours),
      })
      setResult(data)
      toast.success('Occupancy optimization complete')
    } catch (err) {
      toast.error('Optimization failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Occupancy Optimization
          </h1>
          <p className="text-dark-400 mt-1">HVAC and lighting setpoint and schedule recommendations.</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-dark-400 text-xs block mb-1">Zone (optional)</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Floor 3"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-dark-400 text-xs block mb-1">Target occupancy %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={targetOccupancy}
              onChange={(e) => setTargetOccupancy(e.target.value)}
              placeholder="optional"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="text-dark-400 text-xs block mb-1">Horizon (hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-dark-400">Analyzing occupancy patterns...</p>
          </div>
        )}

        {result && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Result</h2>
            <pre className="text-dark-200 text-sm whitespace-pre-wrap overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
