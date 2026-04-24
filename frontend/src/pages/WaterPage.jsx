import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  name: '', zone: '', floor: '', system_type: 'supply', flow_rate: '', daily_usage: '', pressure: '', quality_index: '', leak_detected: false, status: 'normal', last_inspection: ''
}

export default function WaterPage() {
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
      const data = await apiGet('/water')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load water data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/water', { ...form, floor: Number(form.floor), flow_rate: Number(form.flow_rate), daily_usage: Number(form.daily_usage), pressure: Number(form.pressure), quality_index: Number(form.quality_index), leak_detected: form.leak_detected === true || form.leak_detected === 'true' })
      toast.success('Water system added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add water system')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/water/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), flow_rate: Number(form.flow_rate), daily_usage: Number(form.daily_usage), pressure: Number(form.pressure), quality_index: Number(form.quality_index), leak_detected: form.leak_detected === true || form.leak_detected === 'true' })
      toast.success('Water system updated')
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
    if (!window.confirm('Delete this water system?')) return
    try {
      await apiDelete(`/water/${selected._id || selected.id}`)
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
      const data = await apiPost(`/water/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ name: item.name || '', zone: item.zone || '', floor: item.floor || '', system_type: item.system_type || 'supply', flow_rate: item.flow_rate || '', daily_usage: item.daily_usage || '', pressure: item.pressure || '', quality_index: item.quality_index || '', leak_detected: item.leak_detected || false, status: item.status || 'normal', last_inspection: item.last_inspection ? item.last_inspection.slice(0, 10) : '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Name</label>
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Zone</label>
        <input type="text" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Floor</label>
        <input type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">System Type</label>
        <select value={form.system_type} onChange={e => setForm({ ...form, system_type: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="supply">Supply</option>
          <option value="drainage">Drainage</option>
          <option value="irrigation">Irrigation</option>
          <option value="fire_suppression">Fire Suppression</option>
          <option value="recycling">Recycling</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Flow Rate</label>
        <input type="number" step="0.1" value={form.flow_rate} onChange={e => setForm({ ...form, flow_rate: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Daily Usage</label>
        <input type="number" step="0.1" value={form.daily_usage} onChange={e => setForm({ ...form, daily_usage: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Pressure</label>
        <input type="number" step="0.1" value={form.pressure} onChange={e => setForm({ ...form, pressure: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Quality Index (0-100)</label>
        <input type="number" min="0" max="100" value={form.quality_index} onChange={e => setForm({ ...form, quality_index: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Leak Detected?</label>
        <select value={String(form.leak_detected)} onChange={e => setForm({ ...form, leak_detected: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="normal">Normal</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Last Inspection</label>
        <input type="date" value={form.last_inspection} onChange={e => setForm({ ...form, last_inspection: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
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
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Droplets size={24} className="text-cyan-400" /></div>
            <h1 className="text-2xl font-bold text-white">Water Management</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Droplets size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No water systems found</p>
            <p className="text-sm mt-1">Add your first water system to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Flow Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Daily Usage</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Pressure</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Quality</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Leak?</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.zone}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.system_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.flow_rate}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.daily_usage}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.pressure}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.quality_index}</td>
                      <td className="px-4 py-3 text-sm">{item.leak_detected ? <span className="text-red-400 font-medium">Yes</span> : <span className="text-green-400">No</span>}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Water System">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add System'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Water System' : 'Water System Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Zone', value: selected.zone },
                  { label: 'Floor', value: selected.floor },
                  { label: 'System Type', value: selected.system_type?.replace(/_/g, ' ') },
                  { label: 'Flow Rate', value: selected.flow_rate || 'N/A' },
                  { label: 'Daily Usage', value: selected.daily_usage || 'N/A' },
                  { label: 'Pressure', value: selected.pressure || 'N/A' },
                  { label: 'Quality Index', value: selected.quality_index || 'N/A' },
                  { label: 'Leak Detected', value: selected.leak_detected ? 'Yes' : 'No' },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Last Inspection', value: selected.last_inspection ? new Date(selected.last_inspection).toLocaleDateString() : 'N/A' },
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
