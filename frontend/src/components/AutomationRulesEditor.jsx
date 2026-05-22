import React, { useState, useEffect } from 'react'
import { Settings2, Plus, Pencil, Trash2, Save, X, Loader2, Power } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'

const emptyForm = {
  zone_name: '',
  day_of_week: 'Mon-Fri',
  start_time: '08:00',
  end_time: '18:00',
  target_temp: 22,
  mode: 'auto',
  enabled: true,
}

export default function AutomationRulesEditor() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const r = await apiGet('/custom-views/hvac-schedules')
      setSchedules(r.schedules || [])
    } catch (e) {
      toast.error('Failed to load schedules')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const startEdit = (s) => {
    setEditingId(s.id)
    setForm({ ...s })
    setAdding(false)
  }
  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setAdding(false) }

  const save = async () => {
    try {
      setSaving(true)
      if (adding) {
        await apiPost('/custom-views/hvac-schedules', form)
        toast.success('Schedule created')
      } else {
        await apiPut(`/custom-views/hvac-schedules/${editingId}`, form)
        toast.success('Schedule updated')
      }
      cancelEdit()
      await load()
    } catch (e) {
      toast.error('Save failed')
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this schedule?')) return
    try {
      await apiDelete(`/custom-views/hvac-schedules/${id}`)
      toast.success('Deleted')
      await load()
    } catch (e) { toast.error('Delete failed') }
  }

  const toggleEnabled = async (s) => {
    try {
      await apiPut(`/custom-views/hvac-schedules/${s.id}`, { enabled: !s.enabled })
      await load()
    } catch (e) { toast.error('Toggle failed') }
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6" data-testid="automation-rules-editor">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="text-green-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Building Automation Rules</h3>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm(emptyForm) }}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm"
        >
          <Plus size={14} /> New Rule
        </button>
      </div>

      {(adding || editingId) && (
        <div className="bg-dark-900/60 rounded-lg p-4 mb-4 border border-dark-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white" placeholder="Zone"
              value={form.zone_name} onChange={e => setForm({ ...form, zone_name: e.target.value })} />
            <input className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white" placeholder="Day"
              value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })} />
            <input className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white" placeholder="Start"
              value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            <input className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white" placeholder="End"
              value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            <input type="number" step="0.5" className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white" placeholder="Target C"
              value={form.target_temp} onChange={e => setForm({ ...form, target_temp: parseFloat(e.target.value) })} />
            <select className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-white"
              value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
              <option value="auto">auto</option>
              <option value="cool">cool</option>
              <option value="heat">heat</option>
              <option value="fan">fan</option>
              <option value="off">off</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-dark-200">
              <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
              Enabled
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={save} disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
            <button onClick={cancelEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white rounded text-sm">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-dark-300"><Loader2 className="animate-spin" size={16} /> Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-dark-400 border-b border-dark-700">
                <th className="text-left p-2">Zone</th>
                <th className="text-left p-2">Day</th>
                <th className="text-left p-2">Window</th>
                <th className="text-left p-2">Target</th>
                <th className="text-left p-2">Mode</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} className="border-b border-dark-700/60 hover:bg-dark-700/30">
                  <td className="p-2 text-white">{s.zone_name}</td>
                  <td className="p-2 text-dark-200">{s.day_of_week}</td>
                  <td className="p-2 text-dark-200">{s.start_time} - {s.end_time}</td>
                  <td className="p-2 text-dark-200">{s.target_temp}C</td>
                  <td className="p-2 text-dark-200">{s.mode}</td>
                  <td className="p-2">
                    <button onClick={() => toggleEnabled(s)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${s.enabled ? 'bg-green-700/40 text-green-200' : 'bg-dark-700 text-dark-400'}`}>
                      <Power size={12} /> {s.enabled ? 'ON' : 'OFF'}
                    </button>
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => startEdit(s)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={14} /></button>
                    <button onClick={() => remove(s.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-dark-400">No schedules. Create one to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
