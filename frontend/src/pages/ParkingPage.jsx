import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  zone_name: '', level: '', zone_type: 'standard', total_spots: '', occupied_spots: '', available_spots: '', hourly_rate: '', revenue_today: '', sensor_status: 'online', peak_occupancy_time: '', status: 'open'
}

export default function ParkingPage() {
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
      const data = await apiGet('/parking')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load parking data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/parking', { ...form, total_spots: Number(form.total_spots), occupied_spots: Number(form.occupied_spots), available_spots: Number(form.available_spots), hourly_rate: Number(form.hourly_rate), revenue_today: Number(form.revenue_today) })
      toast.success('Parking zone added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add parking zone')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/parking/${selected._id || selected.id}`, { ...form, total_spots: Number(form.total_spots), occupied_spots: Number(form.occupied_spots), available_spots: Number(form.available_spots), hourly_rate: Number(form.hourly_rate), revenue_today: Number(form.revenue_today) })
      toast.success('Parking zone updated')
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
    if (!window.confirm('Delete this parking zone?')) return
    try {
      await apiDelete(`/parking/${selected._id || selected.id}`)
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
      const data = await apiPost(`/parking/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ zone_name: item.zone_name || '', level: item.level || '', zone_type: item.zone_type || 'standard', total_spots: item.total_spots || '', occupied_spots: item.occupied_spots || '', available_spots: item.available_spots || '', hourly_rate: item.hourly_rate || '', revenue_today: item.revenue_today || '', sensor_status: item.sensor_status || 'online', peak_occupancy_time: item.peak_occupancy_time || '', status: item.status || 'open' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Zone Name</label>
        <input type="text" value={form.zone_name} onChange={e => setForm({ ...form, zone_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Level</label>
        <input type="text" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Zone Type</label>
        <select value={form.zone_type} onChange={e => setForm({ ...form, zone_type: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="standard">Standard</option>
          <option value="handicap">Handicap</option>
          <option value="ev_charging">EV Charging</option>
          <option value="visitor">Visitor</option>
          <option value="reserved">Reserved</option>
          <option value="motorcycle">Motorcycle</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Total Spots</label>
        <input type="number" value={form.total_spots} onChange={e => setForm({ ...form, total_spots: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Occupied Spots</label>
        <input type="number" value={form.occupied_spots} onChange={e => setForm({ ...form, occupied_spots: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Available Spots</label>
        <input type="number" value={form.available_spots} onChange={e => setForm({ ...form, available_spots: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Hourly Rate ($)</label>
        <input type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Revenue Today ($)</label>
        <input type="number" step="0.01" value={form.revenue_today} onChange={e => setForm({ ...form, revenue_today: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Sensor Status</label>
        <select value={form.sensor_status} onChange={e => setForm({ ...form, sensor_status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Peak Occupancy Time</label>
        <input type="text" value={form.peak_occupancy_time} onChange={e => setForm({ ...form, peak_occupancy_time: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="open">Open</option>
          <option value="full">Full</option>
          <option value="closed">Closed</option>
          <option value="maintenance">Maintenance</option>
        </select>
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
            <div className="p-2 bg-indigo-500/10 rounded-lg"><Car size={24} className="text-indigo-400" /></div>
            <h1 className="text-2xl font-bold text-white">Parking Management</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Car size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No parking zones found</p>
            <p className="text-sm mt-1">Add your first parking zone to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Level</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Occupied</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Available</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Hourly Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Revenue</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Sensor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.zone_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.level}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.zone_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.total_spots}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.occupied_spots}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.available_spots}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">${item.hourly_rate}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">${item.revenue_today}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.sensor_status} /></td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Parking Zone">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Zone'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Parking Zone' : 'Parking Zone Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Zone Name', value: selected.zone_name },
                  { label: 'Level', value: selected.level },
                  { label: 'Zone Type', value: selected.zone_type?.replace(/_/g, ' ') },
                  { label: 'Total Spots', value: selected.total_spots },
                  { label: 'Occupied Spots', value: selected.occupied_spots },
                  { label: 'Available Spots', value: selected.available_spots },
                  { label: 'Hourly Rate', value: `$${selected.hourly_rate}` },
                  { label: 'Revenue Today', value: `$${selected.revenue_today}` },
                  { label: 'Sensor Status', value: <StatusBadge status={selected.sensor_status} /> },
                  { label: 'Peak Occupancy Time', value: selected.peak_occupancy_time || 'N/A' },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
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
