import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Droplet, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { apiPost } from '../api.js'

export default function WaterUsageOptimizationPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await apiPost('/ai/water-usage-optimization', {})
      setResult(data)
      toast.success('Water optimization complete')
    } catch (err) {
      toast.error('Optimization failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-6 h-6 text-cyan-400" />
            Water Usage Optimization
          </h1>
          <p className="text-dark-400 mt-1">Identify leaks, overuse, and recommend conservation strategies.</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 mb-6 flex justify-end">
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Run Water Analysis'}
          </button>
        </div>

        {loading && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-dark-400">Analyzing water records...</p>
          </div>
        )}

        {result && (
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Result</h2>
            <pre className="text-dark-200 text-sm whitespace-pre-wrap overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}
