import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCheck, ArrowLeft, Plus, Pencil, Trash2, Brain, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import AIAnalysisCard from '../components/AIAnalysisCard'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  visitor_name: '', company: '', host_name: '', host_floor: '', purpose: 'meeting', badge_number: '', check_in: '', check_out: '', status: 'pre_registered', id_verified: false, notes: ''
}

export default function VisitorPage() {
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
      const data = await apiGet('/visitors')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load visitor data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/visitors', { ...form, host_floor: Number(form.host_floor), id_verified: form.id_verified === true || form.id_verified === 'true' })
      toast.success('Visitor added')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
    } catch (err) {
      toast.error('Failed to add visitor')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPut(`/visitors/${selected._id || selected.id}`, { ...form, host_floor: Number(form.host_floor), id_verified: form.id_verified === true || form.id_verified === 'true' })
      toast.success('Visitor updated')
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
    if (!window.confirm('Delete this visitor record?')) return
    try {
      await apiDelete(`/visitors/${selected._id || selected.id}`)
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
      const data = await apiPost(`/visitors/${selected._id || selected.id}/analyze`)
      setAnalysis(data)
    } catch (err) {
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setForm({ visitor_name: item.visitor_name || '', company: item.company || '', host_name: item.host_name || '', host_floor: item.host_floor || '', purpose: item.purpose || 'meeting', badge_number: item.badge_number || '', check_in: item.check_in ? item.check_in.slice(0, 16) : '', check_out: item.check_out ? item.check_out.slice(0, 16) : '', status: item.status || 'pre_registered', id_verified: item.id_verified || false, notes: item.notes || '' })
    setEditing(false)
    setAnalysis(null)
    setShowDetail(true)
  }

  const formFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Visitor Name</label>
        <input type="text" value={form.visitor_name} onChange={e => setForm({ ...form, visitor_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Company</label>
        <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Host Name</label>
        <input type="text" value={form.host_name} onChange={e => setForm({ ...form, host_name: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Host Floor</label>
        <input type="number" value={form.host_floor} onChange={e => setForm({ ...form, host_floor: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Purpose</label>
        <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="meeting">Meeting</option>
          <option value="delivery">Delivery</option>
          <option value="maintenance">Maintenance</option>
          <option value="interview">Interview</option>
          <option value="tour">Tour</option>
          <option value="contractor">Contractor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Badge Number</label>
        <input type="text" value={form.badge_number} onChange={e => setForm({ ...form, badge_number: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Check In</label>
        <input type="datetime-local" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Check Out</label>
        <input type="datetime-local" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="pre_registered">Pre-registered</option>
          <option value="denied">Denied</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1">ID Verified?</label>
        <select value={String(form.id_verified)} onChange={e => setForm({ ...form, id_verified: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
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
            <div className="p-2 bg-teal-500/10 rounded-lg"><UserCheck size={24} className="text-teal-400" /></div>
            <h1 className="text-2xl font-bold text-white">Visitor Management</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add New
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No visitors found</p>
            <p className="text-sm mt-1">Add your first visitor to get started</p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Visitor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Host</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Floor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Purpose</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Badge</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Check In</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item._id || item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.visitor_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.company || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.host_name}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.host_floor}</td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.purpose?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.badge_number || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.check_in ? new Date(item.check_in).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Visitor">
          <form onSubmit={handleAdd} className="space-y-4">
            {formFields()}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Add Visitor'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setEditing(false); setAnalysis(null) }} title={editing ? 'Edit Visitor' : 'Visitor Details'} maxWidth="max-w-3xl">
          {selected && !editing ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Visitor Name', value: selected.visitor_name },
                  { label: 'Company', value: selected.company || 'N/A' },
                  { label: 'Host Name', value: selected.host_name },
                  { label: 'Host Floor', value: selected.host_floor },
                  { label: 'Purpose', value: selected.purpose?.replace(/_/g, ' ') },
                  { label: 'Badge Number', value: selected.badge_number || 'N/A' },
                  { label: 'Check In', value: selected.check_in ? new Date(selected.check_in).toLocaleString() : 'N/A' },
                  { label: 'Check Out', value: selected.check_out ? new Date(selected.check_out).toLocaleString() : 'N/A' },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'ID Verified', value: selected.id_verified ? 'Yes' : 'No' },
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
