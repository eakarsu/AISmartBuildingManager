import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  name: '', floor: '', zone: '', occupancy_count: '', brightness_level: '', mode: 'auto', status: 'on', energy_usage: '', schedule: '', last_motion: ''
}

export default function LightingPage() {
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
      const data = await apiGet('/lighting')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load lighting data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/lighting', { ...form, floor: Number(form.floor), occupancy_count: Number(form.occupancy_count), brightness_level: Number(form.brightness_level), energy_usage: Number(form.energy_usage) })
      toast.success('Lighting zone added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add lighting zone')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/lighting/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), occupancy_count: Number(form.occupancy_count), brightness_level: Number(form.brightness_level), energy_usage: Number(form.energy_usage) })
      toast.success('Lighting zone updated')
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
    if (!window.confirm('Delete this lighting zone?')) return
    try {
      await apiDelete(`/lighting/${selected._id || selected.id}`)
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
      const data = await apiPost(`/lighting/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ name: item.name || '', floor: item.floor || '', zone: item.zone || '', occupancy_count: item.occupancy_count || '', brightness_level: item.brightness_level || '', mode: item.mode || 'auto', status: item.status || 'on', energy_usage: item.energy_usage || '', schedule: item.schedule || '', last_motion: item.last_motion ? item.last_motion.slice(0, 16) : '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'floor', label: 'Floor', type: 'number', required: true },
    { key: 'zone', label: 'Zone', type: 'text', required: true },
    { key: 'occupancy_count', label: 'Occupancy Count', type: 'number' },
    { key: 'brightness_level', label: 'Brightness Level (%)', type: 'number', required: true },
    { key: 'mode', label: 'Mode', type: 'select', options: ['auto', 'manual', 'scheduled', 'motion_sensor'] },
    { key: 'status', label: 'Status', type: 'select', options: ['on', 'off', 'dimmed', 'maintenance'] },
    { key: 'energy_usage', label: 'Energy Usage (kWh)', type: 'number' },
    { key: 'schedule', label: 'Schedule', type: 'text' },
    { key: 'last_motion', label: 'Last Motion', type: 'datetime-local' },
  ]

  const renderFormField = (field) => (
    <div key={field.key}>
      <label className="block text-sm font-medium text-dark-300 mb-1">{field.label}</label>
      {field.type === 'select' ? (
        <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}</option>)}
        </select>
      ) : (
        <input type={field.type} step={field.type === 'number' ? '0.1' : undefined} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required={field.required} />
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><ArrowLeft size={20} /></button>
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Lightbulb size={24} className="text-yellow-400" /></div>
            <h1 className="text-2xl font-bold text-white">Smart Lighting</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No lighting zones found</p>
            <p className="text-sm mt-1">Add your first lighting zone to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Occupancy</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Brightness</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Mode</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Energy</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.zone}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.occupancy_count}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.brightness_level}%</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.mode}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.energy_usage} kWh</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Lighting Zone">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {formFields.map(renderFormField)}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Zone'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Lighting Zone' : 'Lighting Zone Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Zone', value: selected.zone },
                  { label: 'Occupancy Count', value: selected.occupancy_count },
                  { label: 'Brightness Level', value: `${selected.brightness_level}%` },
                  { label: 'Mode', value: selected.mode },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Energy Usage', value: `${selected.energy_usage} kWh` },
                  { label: 'Schedule', value: selected.schedule || 'N/A' },
                  { label: 'Last Motion', value: selected.last_motion ? new Date(selected.last_motion).toLocaleString() : 'N/A' },
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
              <div className="grid grid-cols-2 gap-4">
                {formFields.map(renderFormField)}
              </div>
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
