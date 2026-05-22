import React, { useState, useEffect } from 'react'
import { Users, Loader2, RefreshCw } from 'lucide-react'
import { apiGet } from '../api'

function utilColor(u) {
  if (u < 0.3) return 'bg-blue-700/40 text-blue-200'
  if (u < 0.55) return 'bg-green-700/60 text-green-100'
  if (u < 0.8) return 'bg-yellow-600/70 text-yellow-50'
  return 'bg-red-600/80 text-red-50'
}

export default function ZoneOccupancyHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = async () => {
    try {
      setLoading(true); setErr(null)
      const r = await apiGet('/custom-views/occupancy-heatmap')
      setData(r)
    } catch (e) { setErr(String(e.message || e)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="p-6 bg-dark-800 rounded-xl border border-dark-700 flex items-center gap-3 text-dark-300">
      <Loader2 className="animate-spin" size={18} /> Loading heatmap...
    </div>
  )
  if (err) return <div className="p-6 bg-red-900/20 border border-red-700 rounded-xl text-red-300">Error: {err}</div>

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6" data-testid="zone-occupancy-heatmap">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-purple-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Zone Occupancy Heatmap</h3>
        </div>
        <button onClick={load} className="text-dark-300 hover:text-white p-1.5 rounded">
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Occupied / Capacity</div>
          <div className="text-lg font-bold text-white">{data.summary.total_occupied} / {data.summary.total_capacity}</div>
        </div>
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Avg Utilization</div>
          <div className="text-lg font-bold text-purple-400">{Math.round(data.summary.avg_utilization * 100)}%</div>
        </div>
        <div className="bg-dark-900/50 p-3 rounded-lg">
          <div className="text-xs text-dark-400">Peak Zone</div>
          <div className="text-sm font-semibold text-white">{data.summary.peak_zone.floor} - {data.summary.peak_zone.zone}</div>
          <div className="text-xs text-red-300">{Math.round(data.summary.peak_zone.utilization * 100)}%</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-dark-400 font-medium">Floor \\ Zone</th>
              {data.zones.map(z => (
                <th key={z} className="p-2 text-center text-dark-400 font-medium">{z}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.floors.map(floor => (
              <tr key={floor}>
                <td className="p-2 font-medium text-dark-200">{floor}</td>
                {data.zones.map(zone => {
                  const c = data.cells.find(x => x.floor === floor && x.zone === zone)
                  return (
                    <td key={zone} className="p-1">
                      <div className={`rounded-lg p-2 text-center ${utilColor(c.utilization)}`}>
                        <div className="text-xs">{c.occupied}/{c.capacity}</div>
                        <div className="text-xs font-bold">{Math.round(c.utilization * 100)}%</div>
                        <div className="text-[10px] opacity-80">{c.temp_c}C</div>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
