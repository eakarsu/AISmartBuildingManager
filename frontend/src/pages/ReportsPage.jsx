import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, Zap, Thermometer, Droplets, Car, Shield, LayoutGrid, Wrench, Loader2, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiGet } from '../api'

const statusColors = {
  operational: 'bg-green-500',
  active: 'bg-green-500',
  on: 'bg-green-500',
  idle: 'bg-yellow-500',
  standby: 'bg-yellow-500',
  maintenance: 'bg-orange-500',
  offline: 'bg-red-500',
  error: 'bg-red-500',
  disabled: 'bg-gray-500',
}

const priorityConfig = {
  critical: { color: 'bg-red-500/20 border-red-500/50 text-red-400', label: 'Critical' },
  high: { color: 'bg-orange-500/20 border-orange-500/50 text-orange-400', label: 'High' },
  medium: { color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400', label: 'Medium' },
  low: { color: 'bg-green-500/20 border-green-500/50 text-green-400', label: 'Low' },
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState(null)
  const [energyBreakdown, setEnergyBreakdown] = useState([])
  const [systemStatus, setSystemStatus] = useState(null)
  const [floorSummary, setFloorSummary] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const [ov, eb, ss, fs] = await Promise.all([
          apiGet('/reports/overview'),
          apiGet('/reports/energy-breakdown'),
          apiGet('/reports/system-status'),
          apiGet('/reports/floor-summary'),
        ])
        setOverview(ov)
        setEnergyBreakdown(Array.isArray(eb) ? eb : [])
        setSystemStatus(ss)
        setFloorSummary(Array.isArray(fs) ? fs : [])
      } catch (err) {
        setError(err.message || 'Failed to load reports data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const fmt = (val, decimals = 1) => {
    if (val == null || isNaN(val)) return '0'
    return Number(val).toFixed(decimals)
  }

  const fmtCurrency = (val) => {
    if (val == null || isNaN(val)) return '$0.00'
    return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const fmtNumber = (val) => {
    if (val == null || isNaN(val)) return '0'
    return Number(val).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-400" size={40} />
            <span className="ml-3 text-dark-400 text-lg">Loading reports...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Navbar />
        <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="text-red-400 mb-3" size={40} />
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  const parkingOccupancy = overview?.parking?.total_spots
    ? ((overview.parking.occupied_spots / overview.parking.total_spots) * 100).toFixed(1)
    : '0'

  const overviewCards = [
    { label: 'Total Energy', value: `${fmtNumber(overview?.energy?.total_kwh)} kWh`, sub: fmtCurrency(overview?.energy?.total_cost), icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Avg HVAC Efficiency', value: `${fmt(overview?.hvac?.avg_efficiency)}%`, sub: `${overview?.hvac?.total_units || 0} units`, icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Comfort Score', value: fmt(overview?.comfort?.avg_score), sub: 'out of 100', icon: LayoutGrid, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Water Usage', value: `${fmtNumber(overview?.water?.total_usage)} gal`, sub: 'total daily', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Parking Occupancy', value: `${parkingOccupancy}%`, sub: `${overview?.parking?.occupied_spots || 0} / ${overview?.parking?.total_spots || 0} spots`, icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Security Events', value: fmtNumber(overview?.security?.active_events), sub: 'unresolved', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Space Utilization', value: `${fmt(overview?.space?.avg_utilization)}%`, sub: 'across all zones', icon: LayoutGrid, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ]

  const systemLabels = {
    hvac: 'HVAC Units',
    lighting: 'Lighting Zones',
    climate: 'Climate Zones',
    water: 'Water Systems',
    fire_safety: 'Fire Safety',
    elevators: 'Elevators',
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Building <span className="gradient-text">Reports & Analytics</span>
            </h1>
            <p className="text-dark-400 mt-1">Aggregated insights across all building systems</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Overview Cards */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary-400" />
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {overviewCards.map((card) => (
            <div key={card.label} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                  <p className="text-dark-500 text-xs mt-1">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Energy Breakdown */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={20} className="text-green-400" />
          Energy Breakdown by Source
        </h2>
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden mb-8">
          {energyBreakdown.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No energy data available</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left text-dark-400 text-sm font-medium px-6 py-3">Source</th>
                  <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Total kWh</th>
                  <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Total Cost</th>
                  <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Avg Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {energyBreakdown.map((row, i) => (
                  <tr key={row.source || i} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-3 text-white font-medium capitalize">{row.source || 'Unknown'}</td>
                    <td className="px-6 py-3 text-right text-dark-300">{fmtNumber(row.total_kwh)}</td>
                    <td className="px-6 py-3 text-right text-dark-300">{fmtCurrency(row.total_cost)}</td>
                    <td className="px-6 py-3 text-right text-dark-300">{row.avg_efficiency || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* System Status */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Thermometer size={20} className="text-orange-400" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {systemStatus && Object.entries(systemLabels).map(([key, label]) => {
            const statuses = systemStatus[key] || {}
            const total = Object.values(statuses).reduce((s, v) => s + v, 0)
            return (
              <div key={key} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">{label}</h3>
                {total === 0 ? (
                  <p className="text-dark-500 text-sm">No data</p>
                ) : (
                  <>
                    {/* Status bar */}
                    <div className="flex rounded-full overflow-hidden h-3 mb-3">
                      {Object.entries(statuses).map(([status, count]) => (
                        <div
                          key={status}
                          className={`${statusColors[status] || 'bg-gray-500'}`}
                          style={{ width: `${(count / total) * 100}%` }}
                          title={`${status}: ${count}`}
                        />
                      ))}
                    </div>
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(statuses).map(([status, count]) => (
                        <span
                          key={status}
                          className="inline-flex items-center gap-1.5 text-xs text-dark-300"
                        >
                          <span className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`} />
                          <span className="capitalize">{status}</span>
                          <span className="text-dark-500">({count})</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Maintenance Priority */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-red-400" />
          Maintenance by Priority
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['critical', 'high', 'medium', 'low'].map((priority) => {
            const config = priorityConfig[priority]
            const count = overview?.maintenance?.[priority] || 0
            return (
              <div
                key={priority}
                className={`border rounded-xl p-5 text-center ${config.color}`}
              >
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-sm mt-1 font-medium">{config.label}</p>
              </div>
            )
          })}
        </div>

        {/* Floor Summary */}
        {floorSummary.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <LayoutGrid size={20} className="text-blue-400" />
              Floor Summary
            </h2>
            <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left text-dark-400 text-sm font-medium px-6 py-3">Floor</th>
                    <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Occupancy</th>
                    <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Utilization</th>
                    <th className="text-right text-dark-400 text-sm font-medium px-6 py-3">Comfort Score</th>
                  </tr>
                </thead>
                <tbody>
                  {floorSummary.map((row, i) => (
                    <tr key={row.floor || i} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                      <td className="px-6 py-3 text-white font-medium">{row.floor}</td>
                      <td className="px-6 py-3 text-right text-dark-300">{fmtNumber(row.total_occupancy)}</td>
                      <td className="px-6 py-3 text-right text-dark-300">{fmt(row.avg_utilization)}%</td>
                      <td className="px-6 py-3 text-right text-dark-300">{row.avg_comfort ? fmt(row.avg_comfort) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
