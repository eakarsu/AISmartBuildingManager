import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpDown, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  elevator_name: '', elevator_type: 'passenger', serving_floors: '', current_floor: '', status: 'operational', daily_trips: '', avg_wait_time: '', capacity_kg: '', last_maintenance: '', next_maintenance: '', health_score: '', energy_consumption: ''
}

const HealthScore = ({ score }) => {
  const numScore = Number(score) || 0
  const color = numScore > 60 ? 'text-green-400' : numScore > 30 ? 'text-yellow-400' : 'text-red-400'
  const bgColor = numScore > 60 ? 'bg-green-500' : numScore > 30 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${bgColor} rounded-full`} style={{ width: `${Math.min(numScore, 100)}%` }} />
      </div>
      <span className={`text-xs font-medium ${color}`}>{numScore}</span>
    </div>
  )
}

export default function ElevatorPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet('/elevators')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load elevator data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/elevators', { ...form, current_floor: Number(form.current_floor), daily_trips: Number(form.daily_trips), avg_wait_time: Number(form.avg_wait_time), capacity_kg: Number(form.capacity_kg), health_score: Number(form.health_score), energy_consumption: Number(form.energy_consumption) })
      toast.success('Elevator added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add elevator')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/elevators/${selected._id || selected.id}`, { ...form, current_floor: Number(form.current_floor), daily_trips: Number(form.daily_trips), avg_wait_time: Number(form.avg_wait_time), capacity_kg: Number(form.capacity_kg), health_score: Number(form.health_score), energy_consumption: Number(form.energy_consumption) })
      toast.success('Elevator updated')
      setEditing(false)
      setShowDetail(false)
      fetchItems()
    } catch (err) {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this elevator?')) return
    try {
      await apiDelete(`/elevators/${selected._id || selected.id}`)
      toast.success('Deleted')
      setShowDetail(false)
      fetchItems()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      setAnalysis(null)
      const data = await apiPost(`/elevators/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ elevator_name: item.elevator_name || '', elevator_type: item.elevator_type || 'passenger', serving_floors: item.serving_floors || '', current_floor: item.current_floor || '', status: item.status || 'operational', daily_trips: item.daily_trips || '', avg_wait_time: item.avg_wait_time || '', capacity_kg: item.capacity_kg || '', last_maintenance: item.last_maintenance ? item.last_maintenance.slice(0, 10) : '', next_maintenance: item.next_maintenance ? item.next_maintenance.slice(0, 10) : '', health_score: item.health_score || '', energy_consumption: item.energy_consumption || '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Elevator Name</label>
        <input type="text" value={form.elevator_name} onChange={e => setForm({ ...form, elevator_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Elevator Type</label>
        <select value={form.elevator_type} onChange={e => setForm({ ...form, elevator_type: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="passenger">Passenger</option>
          <option value="freight">Freight</option>
          <option value="service">Service</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Serving Floors</label>
        <input type="text" value={form.serving_floors} onChange={e => setForm({ ...form, serving_floors: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" placeholder="e.g. 1-20" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Current Floor</label>
        <input type="number" value={form.current_floor} onChange={e => setForm({ ...form, current_floor: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="operational">Operational</option>
          <option value="out_of_service">Out of Service</option>
          <option value="maintenance">Maintenance</option>
          <option value="emergency_stop">Emergency Stop</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Daily Trips</label>
        <input type="number" value={form.daily_trips} onChange={e => setForm({ ...form, daily_trips: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Avg Wait Time (sec)</label>
        <input type="number" step="0.1" value={form.avg_wait_time} onChange={e => setForm({ ...form, avg_wait_time: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Capacity (kg)</label>
        <input type="number" value={form.capacity_kg} onChange={e => setForm({ ...form, capacity_kg: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Last Maintenance</label>
        <input type="date" value={form.last_maintenance} onChange={e => setForm({ ...form, last_maintenance: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Next Maintenance</label>
        <input type="date" value={form.next_maintenance} onChange={e => setForm({ ...form, next_maintenance: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Health Score (0-100)</label>
        <input type="number" min="0" max="100" value={form.health_score} onChange={e => setForm({ ...form, health_score: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Energy Consumption (kWh)</label>
        <input type="number" step="0.1" value={form.energy_consumption} onChange={e => setForm({ ...form, energy_consumption: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><ArrowLeft size={20} /></button>
            <div className="p-2 bg-slate-500/10 rounded-lg"><ArrowUpDown size={24} className="text-slate-400" /></div>
            <h1 className="text-2xl font-bold text-white">Elevator Management</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <ArrowUpDown size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No elevators found</p>
            <p className="text-sm mt-1">Add your first elevator to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Serving Floors</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Current Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Daily Trips</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Avg Wait</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Health Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Energy</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.elevator_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.elevator_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.serving_floors}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.current_floor}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.daily_trips}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.avg_wait_time}s</td>
                      <td className="px-4 py-3"><HealthScore score={item.health_score} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.energy_consumption} kWh</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Elevator">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Elevator'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Elevator' : 'Elevator Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Elevator Name', value: selected.elevator_name },
                  { label: 'Elevator Type', value: selected.elevator_type?.replace(/_/g, ' ') },
                  { label: 'Serving Floors', value: selected.serving_floors },
                  { label: 'Current Floor', value: selected.current_floor },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Daily Trips', value: selected.daily_trips || 'N/A' },
                  { label: 'Avg Wait Time', value: selected.avg_wait_time ? `${selected.avg_wait_time}s` : 'N/A' },
                  { label: 'Capacity', value: selected.capacity_kg ? `${selected.capacity_kg} kg` : 'N/A' },
                  { label: 'Last Maintenance', value: selected.last_maintenance ? new Date(selected.last_maintenance).toLocaleDateString() : 'N/A' },
                  { label: 'Next Maintenance', value: selected.next_maintenance ? new Date(selected.next_maintenance).toLocaleDateString() : 'N/A' },
                  { label: 'Health Score', value: <HealthScore score={selected.health_score} /> },
                  { label: 'Energy Consumption', value: selected.energy_consumption ? `${selected.energy_consumption} kWh` : 'N/A' },
                ].map((field, i) => (
                  <div key={i} className="bg-dark-900 rounded-lg p-3">
                    <p className="text-xs text-dark-400 mb-1">{field.label}</p>
                    <div className="text-sm text-white font-medium">{field.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm"><Pencil size={14} /> Edit</button>
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm"><Trash2 size={14} /> Delete</button>
                <button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 ml-auto">
                  {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                  {analyzing ? 'Analyzing...' : 'AI Analyze'}
                </button>
              </div>
              {analysis && <AIAnalysisCard analysis={analysis} />}
            </div>
          ) : selected && editing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              {formFields()}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          ) : null}
        </Modal>
      </main>
    </div>
  )
}
