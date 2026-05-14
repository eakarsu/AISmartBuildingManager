import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { TrendingUp, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiPost } from '../api.js'

export default function EnergyForecastPage() {
  const [horizonDays, setHorizonDays] = useState(30)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await apiPost('/ai/energy-forecast', {
        horizon_days: Number(horizonDays),
      })
      setResult(data)
      toast.success('Energy forecast complete')
    } catch (err) {
      toast.error('Forecast failed: ' + err.message)
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
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Energy Forecast
          </h1>
          <p className="text-dark-400 mt-1">Forecast usage and peak demand from historical records.</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-dark-400 text-xs block mb-1">Horizon (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={horizonDays}
              onChange={(e) => setHorizonDays(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="md:col-span-3 flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Forecasting...' : 'Run Forecast'}
          </button>
        </div>

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-dark-400">Analyzing energy history...</p>
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
