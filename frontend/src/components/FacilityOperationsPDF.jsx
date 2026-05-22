import React, { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FacilityOperationsPDF() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/custom-views/operations-pdf', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facility-operations-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded')
    } catch (e) {
      toast.error('Download failed: ' + (e.message || e))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6" data-testid="facility-operations-pdf">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Facility Operations Report</h3>
      </div>
      <p className="text-sm text-dark-300 mb-4">
        Generate a printable PDF summary covering KPIs, scheduled maintenance, and
        operational recommendations across the building portfolio.
      </p>
      <ul className="text-sm text-dark-300 list-disc pl-5 mb-5 space-y-1">
        <li>Executive summary &amp; KPIs (energy, occupancy, alerts)</li>
        <li>Upcoming maintenance windows (next 14 days)</li>
        <li>Engineering recommendations &amp; savings opportunities</li>
      </ul>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
      >
        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {downloading ? 'Generating...' : 'Download PDF'}
      </button>
    </div>
  )
}
