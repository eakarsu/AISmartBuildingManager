import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldAlert, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiPost } from '../api.js'

export default function SecurityAnomalyPage() {
  const [windowHours, setWindowHours] = useState(24)
  const [zone, setZone] = useState('')
  const [includeOffHours, setIncludeOffHours] = useState(true)
  const [includeTailgating, setIncludeTailgating] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await apiPost('/ai/security-anomaly-detection', {
        window_hours: Number(windowHours),
        zone: zone || undefined,
        include_off_hours: includeOffHours,
        include_tailgating: includeTailgating,
      })
      setResult(data)
      toast.success('Anomaly detection complete')
    } catch (err) {
      toast.error('Detection failed: ' + err.message)
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
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Security Anomaly Detection
          </h1>
          <p className="text-dark-400 mt-1">Off-hours / tailgating / badge-clone / unusual-path detection.</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-dark-400 text-xs block mb-1">Window (hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={windowHours}
              onChange={(e) => setWindowHours(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs block mb-1">Zone (optional)</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Server Room"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-dark-400 text-xs block mb-1">Off-hours</label>
            <select
              value={String(includeOffHours)}
              onChange={(e) => setIncludeOffHours(e.target.value === 'true')}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="true">Include</option>
              <option value="false">Exclude</option>
            </select>
          </div>
          <div>
            <label className="text-dark-400 text-xs block mb-1">Tailgating</label>
            <select
              value={String(includeTailgating)}
              onChange={(e) => setIncludeTailgating(e.target.value === 'true')}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="true">Include</option>
              <option value="false">Exclude</option>
            </select>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="md:col-span-4 flex items-center justify-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Detecting...' : 'Detect Anomalies'}
          </button>
        </div>

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-dark-400">Analyzing security events...</p>
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
