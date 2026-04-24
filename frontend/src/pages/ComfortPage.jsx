import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  tenant_name: '', unit: '', floor: '', overall_score: '', temperature_score: '', air_quality_score: '', lighting_score: '', noise_score: '', feedback: '', survey_date: ''
}

export default function ComfortPage() {
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
      const data = await apiGet('/comfort')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load comfort data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/comfort', { ...form, floor: Number(form.floor), overall_score: Number(form.overall_score), temperature_score: Number(form.temperature_score), air_quality_score: Number(form.air_quality_score), lighting_score: Number(form.lighting_score), noise_score: Number(form.noise_score) })
      toast.success('Comfort record added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add comfort record')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/comfort/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), overall_score: Number(form.overall_score), temperature_score: Number(form.temperature_score), air_quality_score: Number(form.air_quality_score), lighting_score: Number(form.lighting_score), noise_score: Number(form.noise_score) })
      toast.success('Comfort record updated')
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
    if (!window.confirm('Delete this comfort record?')) return
    try {
      await apiDelete(`/comfort/${selected._id || selected.id}`)
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
      const data = await apiPost(`/comfort/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ tenant_name: item.tenant_name || '', unit: item.unit || '', floor: item.floor || '', overall_score: item.overall_score || '', temperature_score: item.temperature_score || '', air_quality_score: item.air_quality_score || '', lighting_score: item.lighting_score || '', noise_score: item.noise_score || '', feedback: item.feedback || '', survey_date: item.survey_date ? item.survey_date.slice(0, 10) : '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = [
    { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
    { key: 'unit', label: 'Unit', type: 'text', required: true },
    { key: 'floor', label: 'Floor', type: 'number', required: true },
    { key: 'overall_score', label: 'Overall Score (0-100)', type: 'number', required: true },
    { key: 'temperature_score', label: 'Temperature Score (0-100)', type: 'number' },
    { key: 'air_quality_score', label: 'Air Quality Score (0-100)', type: 'number' },
    { key: 'lighting_score', label: 'Lighting Score (0-100)', type: 'number' },
    { key: 'noise_score', label: 'Noise Score (0-100)', type: 'number' },
    { key: 'survey_date', label: 'Survey Date', type: 'date' },
    { key: 'feedback', label: 'Feedback', type: 'text' },
  ]

  const renderFormField = (field) => (
    <div key={field.key}>
      <label className="block text-sm font-medium text-dark-300 mb-1">{field.label}</label>
      {field.type === 'select' ? (
        <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ')}</option>)}
        </select>
      ) : (
        <input type={field.type} step={field.type === 'number' ? '1' : undefined} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required={field.required} />
      )}
    </div>
  )

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><ArrowLeft size={20} /></button>
            <div className="p-2 bg-pink-500/10 rounded-lg"><Heart size={24} className="text-pink-400" /></div>
            <h1 className="text-2xl font-bold text-white">Tenant Comfort</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Heart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No comfort records found</p>
            <p className="text-sm mt-1">Add your first comfort record to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Tenant</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Overall Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Temperature</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Air Quality</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Lighting</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Noise</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.tenant_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${getScoreColor(item.overall_score)}`}>{item.overall_score}</td>
                      <td className={`px-4 py-3 text-sm ${getScoreColor(item.temperature_score)}`}>{item.temperature_score}</td>
                      <td className={`px-4 py-3 text-sm ${getScoreColor(item.air_quality_score)}`}>{item.air_quality_score}</td>
                      <td className={`px-4 py-3 text-sm ${getScoreColor(item.lighting_score)}`}>{item.lighting_score}</td>
                      <td className={`px-4 py-3 text-sm ${getScoreColor(item.noise_score)}`}>{item.noise_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Comfort Record">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">{formFields.map(renderFormField)}</div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Record'}</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Comfort Record' : 'Comfort Record Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Tenant Name', value: selected.tenant_name },
                  { label: 'Unit', value: selected.unit },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Overall Score', value: <span className={`font-semibold ${getScoreColor(selected.overall_score)}`}>{selected.overall_score}/100</span> },
                  { label: 'Temperature Score', value: <span className={getScoreColor(selected.temperature_score)}>{selected.temperature_score}/100</span> },
                  { label: 'Air Quality Score', value: <span className={getScoreColor(selected.air_quality_score)}>{selected.air_quality_score}/100</span> },
                  { label: 'Lighting Score', value: <span className={getScoreColor(selected.lighting_score)}>{selected.lighting_score}/100</span> },
                  { label: 'Noise Score', value: <span className={getScoreColor(selected.noise_score)}>{selected.noise_score}/100</span> },
                  { label: 'Survey Date', value: selected.survey_date ? new Date(selected.survey_date).toLocaleDateString() : 'N/A' },
                  { label: 'Feedback', value: selected.feedback || 'N/A' },
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
