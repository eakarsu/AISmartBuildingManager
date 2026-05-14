import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Wrench, AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiGet, apiPost } from '../api.js'

function RiskBadge({ level }) {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors[level] || colors.medium}`}>
      {level?.toUpperCase()}
    </span>
  )
}

export default function MaintenancePredictionPage() {
  const [items, setItems] = useState([])
  const [predictions, setPredictions] = useState({})
  const [predicting, setPredicting] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/maintenance')
      .then((data) => setItems(data.data || data || []))
      .catch(() => toast.error('Failed to load maintenance items'))
      .finally(() => setLoading(false))
  }, [])

  const predict = async (item) => {
    setPredicting(item.id)
    try {
      const result = await apiPost(`/maintenance/${item.id}/predict-failure`, {})
      setPredictions((prev) => ({ ...prev, [item.id]: result }))
      toast.success(`Prediction complete for ${item.equipment_name}`)
    } catch (err) {
      toast.error('Prediction failed: ' + err.message)
    } finally {
      setPredicting(null)
    }
  }

  const predictAll = async () => {
    for (const item of items) {
      try {
        const result = await apiPost(`/maintenance/${item.id}/predict-failure`, {})
        setPredictions((prev) => ({ ...prev, [item.id]: result }))
      } catch (_) {}
    }
    toast.success('All predictions complete')
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-red-400" />
              Predictive Maintenance
            </h1>
            <p className="text-dark-400 mt-1">AI-powered failure probability analysis for all equipment</p>
          </div>
          <button
            onClick={predictAll}
            disabled={items.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            Predict All Failures
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-dark-400">Loading equipment...</div>
        )}

        <div className="space-y-4">
          {items.map((item) => {
            const pred = predictions[item.id]?.prediction
            return (
              <div key={item.id} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div>
                    <h3 className="text-white font-semibold">{item.equipment_name}</h3>
                    <p className="text-dark-400 text-sm">{item.equipment_type} · {item.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {pred && <RiskBadge level={pred.risk_level} />}
                    <button
                      onClick={() => predict(item)}
                      disabled={predicting === item.id}
                      className="text-xs px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg"
                    >
                      {predicting === item.id ? 'Analyzing...' : 'Predict Failure'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Health Score</p>
                    <p className="text-white font-medium">{item.health_score ?? 'N/A'}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Status</p>
                    <p className="text-white font-medium capitalize">{item.status}</p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-2">
                    <p className="text-dark-400 text-xs">Next Service</p>
                    <p className="text-white font-medium">{item.next_service || 'N/A'}</p>
                  </div>
                </div>

                {pred && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-dark-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            pred.failure_probability_pct >= 70 ? 'bg-red-500' :
                            pred.failure_probability_pct >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${pred.failure_probability_pct || 0}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-16 text-right">
                        {pred.failure_probability_pct}% risk
                      </span>
                    </div>

                    {pred.estimated_days_to_failure && (
                      <p className="text-sm text-dark-300">
                        Estimated days to failure: <span className="text-white font-medium">{pred.estimated_days_to_failure}</span>
                      </p>
                    )}

                    {pred.primary_failure_modes?.length > 0 && (
                      <div>
                        <p className="text-dark-400 text-xs mb-1">Primary Failure Modes:</p>
                        <ul className="space-y-1">
                          {pred.primary_failure_modes.map((m, i) => (
                            <li key={i} className="text-dark-300 text-sm flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" /> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pred.recommended_actions?.length > 0 && (
                      <div>
                        <p className="text-dark-400 text-xs mb-1">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {pred.recommended_actions.map((a, i) => (
                            <li key={i} className="text-dark-300 text-sm flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                              <span>{a.action}</span>
                              <span className="text-dark-500 text-xs">({a.urgency})</span>
                              {a.estimated_cost_usd && <span className="text-green-400 text-xs">${a.estimated_cost_usd}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pred.reasoning && (
                      <p className="text-dark-400 text-xs italic">{pred.reasoning}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!loading && items.length === 0 && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <Wrench className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No maintenance items found</p>
          </div>
        )}
      </main>
    </div>
  )
}
