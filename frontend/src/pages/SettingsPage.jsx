import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Building, Bell, Shield, Zap, Wrench, Save, RotateCcw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { apiGet, apiPut, apiPost } from '../api'

const CATEGORIES = [
  { key: 'general', label: 'General', icon: Building },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'energy', label: 'Energy', icon: Zap },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
]

function formatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function isBoolean(value) {
  return value === 'true' || value === 'false'
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('general')
  const [editedValues, setEditedValues] = useState({})

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await apiGet('/settings')
      setSettings(Array.isArray(data) ? data : [])
      setEditedValues({})
    } catch (err) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const categorySettings = settings.filter(s => s.category === activeCategory)

  const getValue = (key) => {
    if (editedValues.hasOwnProperty(key)) return editedValues[key]
    const setting = settings.find(s => s.key === key)
    return setting ? setting.value : ''
  }

  const handleChange = (key, value) => {
    setEditedValues(prev => ({ ...prev, [key]: value }))
  }

  const handleToggle = (key) => {
    const current = getValue(key)
    handleChange(key, current === 'true' ? 'false' : 'true')
  }

  const handleSaveCategory = async () => {
    const toSave = categorySettings.filter(s => editedValues.hasOwnProperty(s.key))
    if (toSave.length === 0) {
      toast('No changes to save', { icon: '\u2139\ufe0f' })
      return
    }
    try {
      setSaving(true)
      for (const s of toSave) {
        await apiPut(`/settings/${s.key}`, { value: editedValues[s.key] })
      }
      toast.success('Settings saved')
      await fetchSettings()
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all settings to defaults? This cannot be undone.')) return
    try {
      setSaving(true)
      await apiPost('/settings/reset')
      toast.success('Settings reset to defaults')
      await fetchSettings()
    } catch (err) {
      toast.error('Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = categorySettings.some(s => editedValues.hasOwnProperty(s.key))

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-400 hover:text-white hover:border-dark-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-500/10 rounded-lg">
                <Settings className="text-primary-500" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Building Settings</h1>
                <p className="text-dark-400 text-sm">Configure building parameters and preferences</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 text-dark-400 rounded-lg hover:text-red-400 hover:border-red-500/50 transition-colors"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-dark-800 text-dark-400 border border-dark-700 hover:text-white hover:border-dark-600'
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="space-y-6">
              {categorySettings.map(setting => (
                <div key={setting.key} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white">
                    {formatLabel(setting.key)}
                  </label>
                  {isBoolean(setting.value) ? (
                    <div
                      onClick={() => handleToggle(setting.key)}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${
                        getValue(setting.key) === 'true' ? 'bg-primary-500' : 'bg-dark-600'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          getValue(setting.key) === 'true' ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="text-sm text-dark-300">
                        {getValue(setting.key) === 'true' ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={getValue(setting.key)}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500"
                    />
                  )}
                  {setting.description && (
                    <p className="text-xs text-dark-400">{setting.description}</p>
                  )}
                </div>
              ))}

              {categorySettings.length === 0 && (
                <p className="text-dark-400 text-center py-8">No settings found for this category.</p>
              )}
            </div>

            {/* Save Button */}
            {categorySettings.length > 0 && (
              <div className="mt-8 pt-6 border-t border-dark-700 flex justify-end">
                <button
                  onClick={handleSaveCategory}
                  disabled={saving || !hasChanges}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    hasChanges
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                  }`}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
