import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Zap, Wrench, Wind } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import Navbar from '../components/Navbar'
import { apiPost, apiGet } from '../api.js'

function ScoreGauge({ label, score, icon: Icon, color }) {
  const pct = Math.min(100, Math.max(0, score || 0))
  const statusColor = pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col items-center">
      <Icon className={`w-8 h-8 mb-2 ${statusColor}`} />
      <p className="text-dark-400 text-sm mb-1">{label}</p>
      <p className={`text-4xl font-bold ${statusColor}`}>{pct}</p>
      <p className="text-dark-500 text-xs">/100</p>
      <div className="w-full bg-dark-700 rounded-full h-2 mt-3">
        <div
          className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function BuildingHealthPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const data = await apiPost('/ai/building-health', {})
      setHealth(data)
      toast.success('Building health analysis complete')
    } catch (err) {
      toast.error('Analysis failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const radarData = health?.health ? [
    { subject: 'HVAC', score: health.health.hvac_score || 0 },
    { subject: 'Energy', score: health.health.energy_score || 0 },
    { subject: 'Maintenance', score: health.health.maintenance_score || 0 },
    { subject: 'Overall', score: health.health.overall_health_score || 0 },
  ] : []

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              Building Health Analysis
            </h1>
            <p className="text-dark-400 mt-1">Cross-domain AI analysis of HVAC, energy, and maintenance systems</p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>

        {!health && !loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <Activity className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400 text-lg">Click "Run AI Analysis" to get a comprehensive building health report</p>
          </div>
        )}

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-dark-400">Analyzing HVAC, energy, and maintenance data...</p>
          </div>
        )}

        {health && (
          <div className="space-y-6">
            {/* Score cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreGauge label="Overall Health" score={health.health?.overall_health_score} icon={Activity} />
              <ScoreGauge label="HVAC" score={health.health?.hvac_score} icon={Wind} />
              <ScoreGauge label="Energy" score={health.health?.energy_score} icon={Zap} />
              <ScoreGauge label="Maintenance" score={health.health?.maintenance_score} icon={Wrench} />
            </div>

            {/* Radar chart + savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Health Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-white font-semibold">Summary</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{health.health?.summary || 'No summary available.'}</p>
                {health.health?.estimated_savings_usd_monthly && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 font-semibold text-lg">
                      ${health.health.estimated_savings_usd_monthly.toLocaleString()}/month
                    </p>
                    <p className="text-dark-400 text-sm">Estimated monthly savings potential</p>
                  </div>
                )}
              </div>
            </div>

            {/* Critical issues */}
            {health.health?.critical_issues?.length > 0 && (
              <div className="bg-dark-800 border border-red-500/30 rounded-xl p-5">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Critical Issues
                </h3>
                <ul className="space-y-2">
                  {health.health.critical_issues.map((issue, i) => (
                    <li key={i} className="text-dark-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {health.health?.recommendations?.length > 0 && (
              <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Recommendations
                </h3>
                <ol className="space-y-2">
                  {health.health.recommendations.map((rec, i) => (
                    <li key={i} className="text-dark-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 font-bold">{i + 1}.</span> {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-dark-500 text-xs">Model: {health.model} — Analyzed at {health.timestamp}</p>
          </div>
        )}
      </main>
    </div>
  )
}
