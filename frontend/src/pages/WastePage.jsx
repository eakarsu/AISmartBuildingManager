import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  container_name: '', location: '', floor: '', waste_type: 'general', capacity_liters: '', fill_level: '', last_collected: '', next_collection: '', daily_avg_kg: '', contamination_rate: '', status: 'normal'
}

const FillLevelBar = ({ level }) => {
  const numLevel = Number(level) || 0
  const color = numLevel >= 90 ? 'bg-red-500' : numLevel >= 70 ? 'bg-yellow-500' : numLevel >= 50 ? 'bg-orange-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(numLevel, 100)}%` }} />
      </div>
      <span className="text-xs text-dark-300">{numLevel}%</span>
    </div>
  )
}

export default function WastePage() {
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
      const data = await apiGet('/waste')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load waste data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/waste', { ...form, floor: Number(form.floor), capacity_liters: Number(form.capacity_liters), fill_level: Number(form.fill_level), daily_avg_kg: Number(form.daily_avg_kg), contamination_rate: Number(form.contamination_rate) })
      toast.success('Waste container added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add waste container')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/waste/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), capacity_liters: Number(form.capacity_liters), fill_level: Number(form.fill_level), daily_avg_kg: Number(form.daily_avg_kg), contamination_rate: Number(form.contamination_rate) })
      toast.success('Waste container updated')
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
    if (!window.confirm('Delete this waste container?')) return
    try {
      await apiDelete(`/waste/${selected._id || selected.id}`)
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
      const data = await apiPost(`/waste/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ container_name: item.container_name || '', location: item.location || '', floor: item.floor || '', waste_type: item.waste_type || 'general', capacity_liters: item.capacity_liters || '', fill_level: item.fill_level || '', last_collected: item.last_collected ? item.last_collected.slice(0, 16) : '', next_collection: item.next_collection ? item.next_collection.slice(0, 16) : '', daily_avg_kg: item.daily_avg_kg || '', contamination_rate: item.contamination_rate || '', status: item.status || 'normal' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Container Name</label>
        <input type="text" value={form.container_name} onChange={e => setForm({ ...form, container_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Location</label>
        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Floor</label>
        <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Waste Type</label>
        <select value={form.waste_type} onChange={e => setForm({ ...form, waste_type: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="general">General</option>
          <option value="recycling">Recycling</option>
          <option value="organic">Organic</option>
          <option value="hazardous">Hazardous</option>
          <option value="electronic">Electronic</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Capacity (Liters)</label>
        <input type="number" value={form.capacity_liters} onChange={e => setForm({ ...form, capacity_liters: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Fill Level (0-100)</label>
        <input type="number" min="0" max="100" value={form.fill_level} onChange={e => setForm({ ...form, fill_level: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Last Collected</label>
        <input type="datetime-local" value={form.last_collected} onChange={e => setForm({ ...form, last_collected: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Next Collection</label>
        <input type="datetime-local" value={form.next_collection} onChange={e => setForm({ ...form, next_collection: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Daily Avg (kg)</label>
        <input type="number" step="0.1" value={form.daily_avg_kg} onChange={e => setForm({ ...form, daily_avg_kg: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Contamination Rate (%)</label>
        <input type="number" step="0.1" value={form.contamination_rate} onChange={e => setForm({ ...form, contamination_rate: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="normal">Normal</option>
          <option value="nearly_full">Nearly Full</option>
          <option value="full">Full</option>
          <option value="contaminated">Contaminated</option>
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
            <div className="p-2 bg-emerald-500/10 rounded-lg"><Package size={24} className="text-emerald-400" /></div>
            <h1 className="text-2xl font-bold text-white">Waste Management</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No waste containers found</p>
            <p className="text-sm mt-1">Add your first waste container to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Container</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Capacity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Fill Level</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Last Collected</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Next Collection</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.container_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.waste_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.capacity_liters}L</td>
                      <td className="px-4 py-3"><FillLevelBar level={item.fill_level} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.last_collected ? new Date(item.last_collected).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.next_collection ? new Date(item.next_collection).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Waste Container">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Container'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Waste Container' : 'Waste Container Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Container Name', value: selected.container_name },
                  { label: 'Location', value: selected.location },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Waste Type', value: selected.waste_type?.replace(/_/g, ' ') },
                  { label: 'Capacity', value: `${selected.capacity_liters}L` },
                  { label: 'Fill Level', value: <FillLevelBar level={selected.fill_level} /> },
                  { label: 'Last Collected', value: selected.last_collected ? new Date(selected.last_collected).toLocaleString() : 'N/A' },
                  { label: 'Next Collection', value: selected.next_collection ? new Date(selected.next_collection).toLocaleString() : 'N/A' },
                  { label: 'Daily Avg (kg)', value: selected.daily_avg_kg || 'N/A' },
                  { label: 'Contamination Rate', value: selected.contamination_rate ? `${selected.contamination_rate}%` : 'N/A' },
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
