import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  system_name: '', system_type: 'smoke_detector', location: '', floor: '', status: 'operational', last_tested: '', next_test: '', battery_level: '', compliance_status: 'compliant', zone_coverage: '', notes: ''
}

const BatteryLevel = ({ level }) => {
  const numLevel = Number(level) || 0
  const color = numLevel > 60 ? 'text-green-400' : numLevel > 30 ? 'text-yellow-400' : 'text-red-400'
  const bgColor = numLevel > 60 ? 'bg-green-500' : numLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${bgColor} rounded-full`} style={{ width: `${Math.min(numLevel, 100)}%` }} />
      </div>
      <span className={`text-xs font-medium ${color}`}>{numLevel}%</span>
    </div>
  )
}

export default function FireSafetyPage() {
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
      const data = await apiGet('/fire')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load fire safety data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/fire', { ...form, floor: Number(form.floor), battery_level: Number(form.battery_level) })
      toast.success('Fire safety system added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add fire safety system')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/fire/${selected._id || selected.id}`, { ...form, floor: Number(form.floor), battery_level: Number(form.battery_level) })
      toast.success('Fire safety system updated')
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
    if (!window.confirm('Delete this fire safety system?')) return
    try {
      await apiDelete(`/fire/${selected._id || selected.id}`)
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
      const data = await apiPost(`/fire/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ system_name: item.system_name || '', system_type: item.system_type || 'smoke_detector', location: item.location || '', floor: item.floor || '', status: item.status || 'operational', last_tested: item.last_tested ? item.last_tested.slice(0, 10) : '', next_test: item.next_test ? item.next_test.slice(0, 10) : '', battery_level: item.battery_level || '', compliance_status: item.compliance_status || 'compliant', zone_coverage: item.zone_coverage || '', notes: item.notes || '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">System Name</label>
        <input type="text" value={form.system_name} onChange={e => setForm({ ...form, system_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">System Type</label>
        <select value={form.system_type} onChange={e => setForm({ ...form, system_type: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="smoke_detector">Smoke Detector</option>
          <option value="sprinkler">Sprinkler</option>
          <option value="fire_alarm">Fire Alarm</option>
          <option value="extinguisher">Extinguisher</option>
          <option value="fire_door">Fire Door</option>
          <option value="emergency_light">Emergency Light</option>
        </select>
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
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="operational">Operational</option>
          <option value="testing">Testing</option>
          <option value="needs_inspection">Needs Inspection</option>
          <option value="faulty">Faulty</option>
          <option value="replaced">Replaced</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Last Tested</label>
        <input type="date" value={form.last_tested} onChange={e => setForm({ ...form, last_tested: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Next Test</label>
        <input type="date" value={form.next_test} onChange={e => setForm({ ...form, next_test: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Battery Level (0-100)</label>
        <input type="number" min="0" max="100" value={form.battery_level} onChange={e => setForm({ ...form, battery_level: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Compliance Status</label>
        <select value={form.compliance_status} onChange={e => setForm({ ...form, compliance_status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="compliant">Compliant</option>
          <option value="non_compliant">Non-Compliant</option>
          <option value="pending_review">Pending Review</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Zone Coverage</label>
        <input type="text" value={form.zone_coverage} onChange={e => setForm({ ...form, zone_coverage: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-dark-300 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" rows={3} />
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
            <div className="p-2 bg-red-500/10 rounded-lg"><Flame size={24} className="text-red-400" /></div>
            <h1 className="text-2xl font-bold text-white">Fire Safety</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Flame size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No fire safety systems found</p>
            <p className="text-sm mt-1">Add your first fire safety system to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">System</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Last Tested</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Next Test</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Battery</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.system_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.system_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.floor}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.last_tested ? new Date(item.last_tested).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.next_test ? new Date(item.next_test).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-3"><BatteryLevel level={item.battery_level} /></td>
                      <td className="px-4 py-3"><StatusBadge status={item.compliance_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Fire Safety System">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add System'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Fire Safety System' : 'Fire Safety System Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'System Name', value: selected.system_name },
                  { label: 'System Type', value: selected.system_type?.replace(/_/g, ' ') },
                  { label: 'Location', value: selected.location },
                  { label: 'Floor', value: selected.floor },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Last Tested', value: selected.last_tested ? new Date(selected.last_tested).toLocaleDateString() : 'N/A' },
                  { label: 'Next Test', value: selected.next_test ? new Date(selected.next_test).toLocaleDateString() : 'N/A' },
                  { label: 'Battery Level', value: <BatteryLevel level={selected.battery_level} /> },
                  { label: 'Compliance', value: <StatusBadge status={selected.compliance_status} /> },
                  { label: 'Zone Coverage', value: selected.zone_coverage || 'N/A' },
                  { label: 'Notes', value: selected.notes || 'N/A' },
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
