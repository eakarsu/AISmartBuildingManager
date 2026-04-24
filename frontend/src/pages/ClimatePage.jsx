import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wind, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  name: '', floor: '', temperature: '', humidity: '', co2_level: '', air_quality_index: 'good', status: 'operational', ventilation_mode: '', zone: '', last_reading: ''
}

export default function ClimatePage() {
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
      const data = await apiGet('/climate')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load climate data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/climate', { ...form, floor: Number(form.floor), temperature: Number(form.temperature), humidity: Number(form.humidity), co2_level: Number(form.co2_level) })
      toast.success('Climate zone added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add climate zone')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/climate/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), temperature: Number(form.temperature), humidity: Number(form.humidity), co2_level: Number(form.co2_level) })
      toast.success('Climate zone updated')
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
    if (!window.confirm('Delete this climate zone?')) return
    try {
      await apiDelete(`/climate/${selected._id || selected.id}`)
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
      const data = await apiPost(`/climate/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ name: item.name || '', floor: item.floor || '', temperature: item.temperature || '', humidity: item.humidity || '', co2_level: item.co2_level || '', air_quality_index: item.air_quality_index || 'good', status: item.status || 'operational', ventilation_mode: item.ventilation_mode || '', zone: item.zone || '', last_reading: item.last_reading ? item.last_reading.slice(0, 16) : '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'floor', label: 'Floor', type: 'number', required: true },
    { key: 'zone', label: 'Zone', type: 'text' },
    { key: 'temperature', label: 'Temperature (°F)', type: 'number', required: true },
    { key: 'humidity', label: 'Humidity (%)', type: 'number', required: true },
    { key: 'co2_level', label: 'CO2 Level (ppm)', type: 'number' },
    { key: 'air_quality_index', label: 'Air Quality Index', type: 'select', options: ['good', 'moderate', 'poor', 'critical'] },
    { key: 'status', label: 'Status', type: 'select', options: ['operational', 'idle', 'maintenance', 'off'] },
    { key: 'ventilation_mode', label: 'Ventilation Mode', type: 'text' },
    { key: 'last_reading', label: 'Last Reading', type: 'datetime-local' },
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
            <div className="p-2 bg-cyan-500/10 rounded-lg"><Wind size={24} className="text-cyan-400" /></div>
            <h1 className="text-2xl font-bold text-white">Climate Control</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Wind size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No climate zones found</p>
            <p className="text-sm mt-1">Add your first climate zone to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Temperature</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Humidity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">CO2</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Air Quality</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.temperature}°F</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.humidity}%</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.co2_level} ppm</td>
                      <td className="px-4 py-3"><StatusBadge status={item.air_quality_index} /></td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Climate Zone">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">{formFields.map(renderFormField)}</div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Zone'}</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Climate Zone' : 'Climate Zone Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Zone', value: selected.zone || 'N/A' },
                  { label: 'Temperature', value: `${selected.temperature}°F` },
                  { label: 'Humidity', value: `${selected.humidity}%` },
                  { label: 'CO2 Level', value: `${selected.co2_level} ppm` },
                  { label: 'Air Quality Index', value: <StatusBadge status={selected.air_quality_index} /> },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Ventilation Mode', value: selected.ventilation_mode || 'N/A' },
                  { label: 'Last Reading', value: selected.last_reading ? new Date(selected.last_reading).toLocaleString() : 'N/A' },
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
              <div className="grid grid-cols-2 gap-4">{formFields.map(renderFormField)}</div>
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
