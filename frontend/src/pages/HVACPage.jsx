import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Thermometer, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  name: '', zone: '', floor: '', status: 'operational', current_temp: '', target_temp: '', efficiency: '', mode: 'auto', energy_kwh: '', last_maintained: ''
}

export default function HVACPage() {
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
      const data = await apiGet('/hvac')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load HVAC data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/hvac', { ...form, current_temp: Number(form.current_temp), target_temp: Number(form.target_temp), efficiency: Number(form.efficiency), floor: Number(form.floor), energy_kwh: Number(form.energy_kwh) })
      toast.success('HVAC unit added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add HVAC unit')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/hvac/${selected._id || selected.id}`, { ...form, current_temp: Number(form.current_temp), target_temp: Number(form.target_temp), efficiency: Number(form.efficiency), floor: Number(form.floor), energy_kwh: Number(form.energy_kwh) })
      toast.success('HVAC unit updated')
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
    if (!window.confirm('Delete this HVAC unit?')) return
    try {
      await apiDelete(`/hvac/${selected._id || selected.id}`)
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
      const data = await apiPost(`/hvac/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ name: item.name || '', zone: item.zone || '', floor: item.floor || '', status: item.status || 'operational', current_temp: item.current_temp || '', target_temp: item.target_temp || '', efficiency: item.efficiency || '', mode: item.mode || 'auto', energy_kwh: item.energy_kwh || '', last_maintained: item.last_maintained ? item.last_maintained.slice(0, 10) : '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><ArrowLeft size={20} /></button>
            <div className="p-2 bg-orange-500/10 rounded-lg"><Thermometer size={24} className="text-orange-400" /></div>
            <h1 className="text-2xl font-bold text-white">HVAC Optimization</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Thermometer size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No HVAC units found</p>
            <p className="text-sm mt-1">Add your first HVAC unit to get started</p>
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Current Temp</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Target Temp</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Efficiency</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.zone}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.current_temp}°F</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.target_temp}°F</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.efficiency}%</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add HVAC Unit">
          <form onSubmit={handleAdd} className="space-y-4">
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
                <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                  <option value="operational">Operational</option>
                  <option value="idle">Idle</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Current Temp (°F)</label>
                <input type="number" step="0.1" value={form.current_temp} onChange={e => setForm({ ...form, current_temp: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Target Temp (°F)</label>
                <input type="number" step="0.1" value={form.target_temp} onChange={e => setForm({ ...form, target_temp: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Efficiency (%)</label>
                <input type="number" step="0.1" value={form.efficiency} onChange={e => setForm({ ...form, efficiency: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Mode</label>
                <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                  <option value="auto">Auto</option>
                  <option value="cooling">Cooling</option>
                  <option value="heating">Heating</option>
                  <option value="fan_only">Fan Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Energy (kWh)</label>
                <input type="number" step="0.1" value={form.energy_kwh} onChange={e => setForm({ ...form, energy_kwh: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Last Maintained</label>
                <input type="date" value={form.last_maintained} onChange={e => setForm({ ...form, last_maintained: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Unit'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit HVAC Unit' : 'HVAC Unit Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Zone', value: selected.zone },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Current Temp', value: `${selected.current_temp}°F` },
                  { label: 'Target Temp', value: `${selected.target_temp}°F` },
                  { label: 'Efficiency', value: `${selected.efficiency}%` },
                  { label: 'Mode', value: selected.mode },
                  { label: 'Energy (kWh)', value: selected.energy_kwh || 'N/A' },
                  { label: 'Last Maintained', value: selected.last_maintained ? new Date(selected.last_maintained).toLocaleDateString() : 'N/A' },
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
                  <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                    <option value="operational">Operational</option>
                    <option value="idle">Idle</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="off">Off</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Current Temp (°F)</label>
                  <input type="number" step="0.1" value={form.current_temp} onChange={e => setForm({ ...form, current_temp: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Target Temp (°F)</label>
                  <input type="number" step="0.1" value={form.target_temp} onChange={e => setForm({ ...form, target_temp: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Efficiency (%)</label>
                  <input type="number" step="0.1" value={form.efficiency} onChange={e => setForm({ ...form, efficiency: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Mode</label>
                  <select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
                    <option value="auto">Auto</option>
                    <option value="cooling">Cooling</option>
                    <option value="heating">Heating</option>
                    <option value="fan_only">Fan Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Energy (kWh)</label>
                  <input type="number" step="0.1" value={form.energy_kwh} onChange={e => setForm({ ...form, energy_kwh: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1">Last Maintained</label>
                  <input type="date" value={form.last_maintained} onChange={e => setForm({ ...form, last_maintained: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
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
