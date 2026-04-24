import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  source: '', zone: '', consumption_kwh: '', cost: '', date: '', peak_hours: '', efficiency_rating: 'good', carbon_footprint: ''
}

export default function EnergyPage() {
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
      const data = await apiGet('/energy')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load energy data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/energy', { ...form, consumption_kwh: Number(form.consumption_kwh), cost: Number(form.cost), peak_hours: Number(form.peak_hours), carbon_footprint: Number(form.carbon_footprint) })
      toast.success('Energy record added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add energy record')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/energy/${selected._id || selected.id}`, { ...form, consumption_kwh: Number(form.consumption_kwh), cost: Number(form.cost), peak_hours: Number(form.peak_hours), carbon_footprint: Number(form.carbon_footprint) })
      toast.success('Energy record updated')
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
    if (!window.confirm('Delete this energy record?')) return
    try {
      await apiDelete(`/energy/${selected._id || selected.id}`)
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
      const data = await apiPost(`/energy/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ source: item.source || '', zone: item.zone || '', consumption_kwh: item.consumption_kwh || '', cost: item.cost || '', date: item.date ? item.date.slice(0, 10) : '', peak_hours: item.peak_hours || '', efficiency_rating: item.efficiency_rating || 'good', carbon_footprint: item.carbon_footprint || '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = [
    { key: 'source', label: 'Source', type: 'select', options: ['electricity', 'natural_gas', 'solar', 'wind', 'geothermal', 'other'], required: true },
    { key: 'zone', label: 'Zone', type: 'text', required: true },
    { key: 'consumption_kwh', label: 'Consumption (kWh)', type: 'number', required: true },
    { key: 'cost', label: 'Cost ($)', type: 'number', required: true },
    { key: 'date', label: 'Date', type: 'date', required: true },
    { key: 'peak_hours', label: 'Peak Hours', type: 'number' },
    { key: 'efficiency_rating', label: 'Efficiency Rating', type: 'select', options: ['good', 'moderate', 'poor', 'critical'] },
    { key: 'carbon_footprint', label: 'Carbon Footprint (kg CO2)', type: 'number' },
  ]

  const renderFormField = (field) => (
    <div key={field.key}>
      <label className="block text-sm font-medium text-dark-300 mb-1">{field.label}</label>
      {field.type === 'select' ? (
        <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}</option>)}
        </select>
      ) : (
        <input type={field.type} step={field.type === 'number' ? '0.01' : undefined} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required={field.required} />
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
            <div className="p-2 bg-green-500/10 rounded-lg"><Zap size={24} className="text-green-400" /></div>
            <h1 className="text-2xl font-bold text-white">Energy Analytics</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Zap size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No energy records found</p>
            <p className="text-sm mt-1">Add your first energy record to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Zone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Consumption (kWh)</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Cost ($)</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Peak Hours</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white capitalize">{(item.source || '').replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.zone}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.consumption_kwh}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">${item.cost}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.peak_hours || 'N/A'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.efficiency_rating} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Energy Record">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">{formFields.map(renderFormField)}</div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Record'}</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Energy Record' : 'Energy Record Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Source', value: (selected.source || '').replace(/_/g, ' ') },
                  { label: 'Zone', value: selected.zone },
                  { label: 'Consumption', value: `${selected.consumption_kwh} kWh` },
                  { label: 'Cost', value: `$${selected.cost}` },
                  { label: 'Date', value: selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A' },
                  { label: 'Peak Hours', value: selected.peak_hours || 'N/A' },
                  { label: 'Efficiency Rating', value: <StatusBadge status={selected.efficiency_rating} /> },
                  { label: 'Carbon Footprint', value: selected.carbon_footprint ? `${selected.carbon_footprint} kg CO2` : 'N/A' },
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
