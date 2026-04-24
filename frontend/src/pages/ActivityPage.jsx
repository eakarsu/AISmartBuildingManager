import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Plus, Pencil, Trash2, LogIn, CheckCircle, Wrench, Filter, ChevronDown, Clock, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { apiGet, apiPost, apiDelete } from '../api'

const ACTION_OPTIONS = ['All', 'create', 'update', 'delete', 'login', 'acknowledge', 'resolve']
const RESOURCE_OPTIONS = ['All', 'hvac', 'lighting', 'security', 'climate', 'energy', 'maintenance', 'comfort', 'space', 'water', 'parking', 'visitors', 'waste', 'fire', 'elevators']

const ACTION_CONFIG = {
  create: { icon: Plus, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', label: 'Create' },
  update: { icon: Pencil, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', label: 'Update' },
  delete: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'Delete' },
  login: { icon: LogIn, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', label: 'Login' },
  acknowledge: { icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'Acknowledge' },
  resolve: { icon: Wrench, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', label: 'Resolve' },
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityPage() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [actionFilter, setActionFilter] = useState('All')
  const [resourceFilter, setResourceFilter] = useState('All')
  const LIMIT = 30

  const fetchActivities = async (newOffset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      let path = `/activity?limit=${LIMIT}&offset=${newOffset}`
      if (actionFilter !== 'All') path += `&action=${actionFilter}`
      if (resourceFilter !== 'All') path += `&resource_type=${resourceFilter}`

      const data = await apiGet(path)
      const rows = data.data || []

      if (append) {
        setActivities(prev => [...prev, ...rows])
      } else {
        setActivities(rows)
      }
      setTotal(data.total || 0)
      setOffset(newOffset)
    } catch (err) {
      toast.error('Failed to load activity log')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchActivities(0, false)
  }, [actionFilter, resourceFilter])

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT
    fetchActivities(newOffset, true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity log entry?')) return
    try {
      await apiDelete(`/activity/${id}`)
      toast.success('Entry deleted')
      fetchActivities(0, false)
    } catch (err) {
      toast.error('Failed to delete entry')
    }
  }

  const hasMore = activities.length < total

  const getActionConfig = (action) => {
    return ACTION_CONFIG[action] || ACTION_CONFIG.create
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 hover:text-white hover:border-dark-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <ClipboardList size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Activity Log</h1>
                <p className="text-sm text-dark-400">Audit trail of all system actions</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-dark-400">
            {total} {total === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-dark-800 rounded-xl border border-dark-700">
          <Filter size={16} className="text-dark-400" />
          <span className="text-sm text-dark-400 font-medium">Filters:</span>

          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="appearance-none bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {ACTION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? 'All Actions' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="appearance-none bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 pr-8 text-sm text-white focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {RESOURCE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? 'All Resources' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          {(actionFilter !== 'All' || resourceFilter !== 'All') && (
            <button
              onClick={() => { setActionFilter('All'); setResourceFilter('All') }}
              className="text-xs text-dark-400 hover:text-white px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-primary-400 animate-spin mb-3" />
            <p className="text-dark-400 text-sm">Loading activity log...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-dark-800 rounded-xl border border-dark-700">
            <div className="p-4 bg-dark-700 rounded-full mb-4">
              <AlertCircle size={32} className="text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No activity found</h3>
            <p className="text-dark-400 text-sm">
              {actionFilter !== 'All' || resourceFilter !== 'All'
                ? 'Try adjusting your filters to see more results.'
                : 'Activity will appear here as actions are performed in the system.'}
            </p>
          </div>
        )}

        {/* Timeline */}
        {!loading && activities.length > 0 && (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-dark-700" />

            <div className="space-y-1">
              {activities.map((activity) => {
                const config = getActionConfig(activity.action)
                const IconComponent = config.icon

                return (
                  <div key={activity.id} className="relative flex items-start gap-4 group">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                      <IconComponent size={18} className={config.color} />
                    </div>

                    {/* Content card */}
                    <div className="flex-1 pb-4">
                      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-600 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-white text-sm">
                                {activity.user_name || 'System'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                                {config.label}
                              </span>
                              {activity.resource_type && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dark-700 text-dark-300 border border-dark-600">
                                  {activity.resource_type.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-dark-300 leading-relaxed">
                              {activity.description || `${activity.action} on ${activity.resource_type || 'system'}${activity.resource_id ? ` #${activity.resource_id}` : ''}`}
                            </p>
                            {activity.user_email && (
                              <p className="text-xs text-dark-500 mt-1">{activity.user_email}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-dark-500">
                              <Clock size={12} />
                              <span>{formatTimestamp(activity.created_at)}</span>
                            </div>
                            <button
                              onClick={() => handleDelete(activity.id)}
                              className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Load more */}
        {!loading && hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm text-dark-300 hover:text-white hover:border-dark-600 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load more ({total - activities.length} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
