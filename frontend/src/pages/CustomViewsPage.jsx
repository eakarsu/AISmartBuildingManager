import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import Navbar from '../components/Navbar'
import EnergyConsumptionChart from '../components/EnergyConsumptionChart'
import ZoneOccupancyHeatmap from '../components/ZoneOccupancyHeatmap'
import FacilityOperationsPDF from '../components/FacilityOperationsPDF'
import AutomationRulesEditor from '../components/AutomationRulesEditor'

export default function CustomViewsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="text-dark-300 hover:text-white inline-flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Dashboard
            </button>
            <div className="h-5 w-px bg-dark-700" />
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-blue-400" size={22} />
              <h1 className="text-2xl font-bold gradient-text">Building Views</h1>
            </div>
          </div>
          <span className="text-xs text-dark-400">Custom Views Dashboard</span>
        </div>

        <p className="text-sm text-dark-300 mb-6">
          Operational dashboards and tools for smart-building portfolio management:
          energy mix, zone-level occupancy intelligence, facility reporting, and
          building automation rule maintenance.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EnergyConsumptionChart />
          <ZoneOccupancyHeatmap />
          <FacilityOperationsPDF />
          <AutomationRulesEditor />
        </div>
      </main>
    </div>
  )
}
