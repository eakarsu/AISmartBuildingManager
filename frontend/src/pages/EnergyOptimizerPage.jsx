import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Zap, TrendingDown, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Navbar from '../components/Navbar'
import { apiPost } from '../api.js'

export default function EnergyOptimizerPage() {
  const [zone, setZone] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runOptimization = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/ai/energy-optimize', { zone: zone || undefined })
      setResult(data)
      toast.success('Energy optimization analysis complete')
    } catch (err) {
      toast.error('Optimization failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const strategyChartData = result?.optimization?.optimization_strategies?.map((s) => ({
    name: s.strategy?.slice(0, 20) + '...',
    savings: s.estimated_savings_pct,
    cost: s.implementation_cost === 'low' ? 1 : s.implementation_cost === 'medium' ? 2 : 3,
  })) || []

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            Energy Optimizer
          </h1>
          <p className="text-dark-400 mt-1">AI-powered energy consumption optimization and cost-reduction strategies</p>
        </div>

        {/* Controls */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-dark-400 text-xs block mb-1">Filter by Zone (optional)</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. North Wing, Floor 2"
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <button
            onClick={runOptimization}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-dark-400">Analyzing energy patterns...</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Efficiency score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 text-center">
                <p className="text-dark-400 text-sm mb-1">Efficiency Score</p>
                <p className={`text-5xl font-bold ${
                  (result.optimization?.efficiency_score || 0) >= 80 ? 'text-green-400' :
                  (result.optimization?.efficiency_score || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>{result.optimization?.efficiency_score ?? 'N/A'}</p>
                <p className="text-dark-500 text-xs">/100</p>
              </div>
              <div className="md:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-5">
                <p className="text-dark-400 text-sm mb-1">Summary</p>
                <p className="text-dark-300 text-sm leading-relaxed">{result.optimization?.summary || 'No summary available.'}</p>
              </div>
            </div>

            {/* Peak usage zones */}
            {result.optimization?.peak_usage_zones?.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Peak Usage Zones</h3>
                <div className="flex flex-wrap gap-2">
                  {result.optimization.peak_usage_zones.map((zone, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">{zone}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Strategies chart */}
            {strategyChartData.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Optimization Strategies — Savings Potential (%)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={strategyChartData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                    <Bar dataKey="savings" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Full strategies list */}
            {result.optimization?.optimization_strategies?.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Detailed Strategies
                </h3>
                <div className="space-y-3">
                  {result.optimization.optimization_strategies.map((s, i) => (
                    <div key={i} className="bg-dark-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium">{s.strategy}</p>
                        <div className="flex gap-2">
                          <span className="text-green-400 text-xs font-medium">-{s.estimated_savings_pct}%</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.implementation_cost === 'low' ? 'bg-green-500/20 text-green-300' :
                            s.implementation_cost === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>{s.implementation_cost} cost</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduling */}
            {result.optimization?.scheduling_recommendations?.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Scheduling Recommendations</h3>
                <ul className="space-y-2">
                  {result.optimization.scheduling_recommendations.map((rec, i) => (
                    <li key={i} className="text-dark-300 text-sm flex items-start gap-2">
                      <TrendingDown className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!loading && !result && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <Zap className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">Click "Run Optimization" to analyze your energy patterns</p>
          </div>
        )}
      </main>
    </div>
  )
}
