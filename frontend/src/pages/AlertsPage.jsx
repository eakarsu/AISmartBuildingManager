import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, Plus, Trash2, CheckCircle, ShieldCheck, Loader2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  title: '', message: '', severity: 'info', source: '', location: '', floor: '', status: 'active'
}

const severityConfig = {
  critical: { color: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-500', icon: AlertCircle },
  warning: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-500', icon: AlertTriangle },
  info: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-500', icon: Info },
}

const statusConfig = {
  active: 'bg-green-500/10 text-green-400 border-green-500/30',
  acknowledged: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-dark-600/50 text-dark-400 border-dark-600',
}

export default function AlertsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ total: 0, by_severity: [], by_status: [] })
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await apiGet('/alerts')
      setItems(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      toast.error('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await apiGet('/alerts/summary/stats')
      setStats(data)
    } catch (err) {
      // stats are non-critical
    }
  }

  useEffect(() => { fetchItems(); fetchStats() }, [])

  const getSeverityCount = (sev) => {
    const found = stats.by_severity.find(s => s.severity === sev)
    return found ? found.count : 0
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await apiPost('/alerts', { ...form, floor: form.floor ? Number(form.floor) : null })
      toast.success('Alert created')
      setShowAdd(false)
      setForm(emptyForm)
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error('Failed to create alert')
    } finally {
      setSaving(false)
    }
  }

  const handleAcknowledge = async () => {
    try {
      const data = await apiPut(`/alerts/${selected.id}/acknowledge`)
      toast.success('Alert acknowledged')
      setSelected(data)
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const handleResolve = async () => {
    try {
      const data = await apiPut(`/alerts/${selected.id}/resolve`)
      toast.success('Alert resolved')
      setSelected(data)
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error('Failed to resolve alert')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this alert?')) return
    try {
      await apiDelete(`/alerts/${selected.id}`)
      toast.success('Alert deleted')
      setShowDetail(false)
      fetchItems()
      fetchStats()
    } catch (err) {
      toast.error('Failed to delete alert')
    }
  }

  const openDetail = (item) => {
    setSelected(item)
    setShowDetail(true)
  }

  const filtered = items.filter(item => {
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    return true
  })

  const formFields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'severity', label: 'Severity', type: 'select', options: ['critical', 'warning', 'info'], required: true },
    { key: 'source', label: 'Source', type: 'select', options: ['hvac', 'lighting', 'security', 'fire', 'elevator', 'energy', 'water', 'parking', 'other'] },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'number' },
    { key: 'message', label: 'Message', type: 'textarea' },
  ]

  const renderFormField = (field) => (
    <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
      <label className="block text-sm font-medium text-dark-300 mb-1">{field.label}</label>
      {field.type === 'select' ? (
        <select value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500">
          {field.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} rows={3} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" />
      ) : (
        <input type={field.type} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500" required={field.required} />
      )}
    </div>
  )

  const SeverityBadge = ({ severity }) => {
    const cfg = severityConfig[severity] || severityConfig.info
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    )
  }

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.active
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const summaryCards = [
    { label: 'Total Alerts', value: stats.total, color: 'from-blue-600/20 to-purple-600/20 border-blue-500/30', textColor: 'text-blue-400', icon: Bell },
    { label: 'Critical', value: getSeverityCount('critical'), color: 'from-red-600/20 to-red-800/20 border-red-500/30', textColor: 'text-red-400', icon: AlertCircle },
    { label: 'Warning', value: getSeverityCount('warning'), color: 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30', textColor: 'text-yellow-400', icon: AlertTriangle },
    { label: 'Info', value: getSeverityCount('info'), color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30', textColor: 'text-blue-400', icon: Info },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"><ArrowLeft size={20} /></button>
            <div className="p-2 bg-red-500/10 rounded-lg"><Bell size={24} className="text-red-400" /></div>
            <h1 className="text-2xl font-bold text-white">Alerts & Notifications</h1>
          </div>
          <button onClick={() => { setForm(emptyForm); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium text-sm">
            <Plus size={16} /> Add Alert
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} border rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-dark-400 font-medium">{card.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
                  </div>
                  <Icon size={24} className={`${card.textColor} opacity-60`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-400 font-medium">Severity:</span>
            {['all', 'critical', 'warning', 'info'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 border border-dark-700'
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-400 font-medium">Status:</span>
            {['all', 'active', 'acknowledged', 'resolved'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 border border-dark-700'
                }`}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-dark-400">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No alerts found</p>
            <p className="text-sm mt-1">
              {items.length === 0 ? 'Create your first alert to get started' : 'No alerts match the current filters'}
            </p>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-dark-400 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr key={item.id || i} onClick={() => openDetail(item)} className={`border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 ${i % 2 === 0 ? 'bg-dark-800' : 'bg-dark-900/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.title}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={item.severity} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300 capitalize">{item.source || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.location || 'N/A'}{item.floor != null ? ` (Floor ${item.floor})` : ''}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-dark-300">{item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Alert Modal */}
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Alert">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">{formFields.map(renderFormField)}</div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-dark-300 hover:text-white bg-dark-700 rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Create Alert'}</button>
            </div>
          </form>
        </Modal>

        {/* Detail Modal */}
        <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Alert Details" maxWidth="max-w-3xl">
          {selected && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Title', value: selected.title },
                  { label: 'Severity', value: <SeverityBadge severity={selected.severity} /> },
                  { label: 'Status', value: <StatusBadge status={selected.status} /> },
                  { label: 'Source', value: selected.source ? selected.source.charAt(0).toUpperCase() + selected.source.slice(1) : 'N/A' },
                  { label: 'Location', value: selected.location || 'N/A' },
                  { label: 'Floor', value: selected.floor != null ? selected.floor : 'N/A' },
                  { label: 'Created', value: selected.created_at ? new Date(selected.created_at).toLocaleString() : 'N/A' },
                  { label: 'Acknowledged', value: selected.acknowledged_at ? new Date(selected.acknowledged_at).toLocaleString() : 'N/A' },
                  { label: 'Resolved', value: selected.resolved_at ? new Date(selected.resolved_at).toLocaleString() : 'N/A' },
                ].map((field, i) => (
                  <div key={i} className="bg-dark-900 rounded-lg p-3">
                    <p className="text-xs text-dark-400 mb-1">{field.label}</p>
                    <div className="text-sm text-white font-medium">{field.value}</div>
                  </div>
                ))}
              </div>
              {selected.message && (
                <div className="bg-dark-900 rounded-lg p-3 mb-4">
                  <p className="text-xs text-dark-400 mb-1">Message</p>
                  <p className="text-sm text-white">{selected.message}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === 'active' && (
                  <button onClick={handleAcknowledge} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium">
                    <CheckCircle size={14} /> Acknowledge
                  </button>
                )}
                {selected.status !== 'resolved' && (
                  <button onClick={handleResolve} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium">
                    <ShieldCheck size={14} /> Resolve
                  </button>
                )}
                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm ml-auto">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  )
}
