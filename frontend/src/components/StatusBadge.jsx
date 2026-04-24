import React from 'react'

const statusColors = {
  operational: 'bg-green-400/10 text-green-400 border-green-400/20',
  running: 'bg-green-400/10 text-green-400 border-green-400/20',
  on: 'bg-green-400/10 text-green-400 border-green-400/20',
  optimal: 'bg-green-400/10 text-green-400 border-green-400/20',
  available: 'bg-green-400/10 text-green-400 border-green-400/20',
  good: 'bg-green-400/10 text-green-400 border-green-400/20',
  active: 'bg-red-400/10 text-red-400 border-red-400/20',
  idle: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  dimmed: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  scheduled: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  reserved: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  moderate: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  maintenance: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  needs_attention: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  warning: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  investigating: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  pending: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  off: 'bg-red-400/10 text-red-400 border-red-400/20',
  critical: 'bg-red-400/10 text-red-400 border-red-400/20',
  high: 'bg-red-400/10 text-red-400 border-red-400/20',
  resolved: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  false_alarm: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  closed: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  low: 'bg-green-400/10 text-green-400 border-green-400/20',
  medium: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
}

export default function StatusBadge({ status }) {
  if (!status) return null
  const normalized = status.toLowerCase().replace(/\s+/g, '_')
  const colorClass = statusColors[normalized] || 'bg-dark-600/50 text-dark-300 border-dark-500'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </span>
  )
}
