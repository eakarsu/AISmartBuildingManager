import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Thermometer, Lightbulb, Wind, Wrench, Zap, Heart, Shield, LayoutGrid, Activity, TrendingUp, Bell, Users, Droplets, Car, UserCheck, Package, Flame, ArrowUpDown, BarChart3, ClipboardList, Settings, UserCircle } from 'lucide-react'
import Navbar from '../components/Navbar'

const features = [
  { name: 'HVAC Optimization', desc: 'AI-powered heating, ventilation & cooling management', icon: Thermometer, route: '/hvac', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400' },
  { name: 'Smart Lighting', desc: 'Occupancy-based intelligent lighting control', icon: Lightbulb, route: '/lighting', color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400' },
  { name: 'Climate Control', desc: 'Zone-based climate & air quality management', icon: Wind, route: '/climate', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  { name: 'Predictive Maintenance', desc: 'AI-driven equipment health & maintenance', icon: Wrench, route: '/maintenance', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
  { name: 'Energy Analytics', desc: 'Energy consumption tracking & cost optimization', icon: Zap, route: '/energy', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
  { name: 'Tenant Comfort', desc: 'Comfort scoring & satisfaction management', icon: Heart, route: '/comfort', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/10', textColor: 'text-pink-400' },
  { name: 'Security Monitoring', desc: 'Building security & event management', icon: Shield, route: '/security', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
  { name: 'Space Utilization', desc: 'Occupancy tracking & space optimization', icon: LayoutGrid, route: '/space', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
  { name: 'Water Management', desc: 'Water usage monitoring & leak detection', icon: Droplets, route: '/water', color: 'from-cyan-500 to-teal-500', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  { name: 'Parking Management', desc: 'Smart parking & occupancy tracking', icon: Car, route: '/parking', color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400' },
  { name: 'Visitor Management', desc: 'Visitor check-in & access control', icon: UserCheck, route: '/visitors', color: 'from-teal-500 to-green-500', bgColor: 'bg-teal-500/10', textColor: 'text-teal-400' },
  { name: 'Waste Management', desc: 'Smart waste collection & recycling', icon: Package, route: '/waste', color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { name: 'Fire Safety', desc: 'Fire detection & emergency systems', icon: Flame, route: '/fire', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
  { name: 'Elevator Management', desc: 'Elevator status & traffic optimization', icon: ArrowUpDown, route: '/elevators', color: 'from-slate-400 to-gray-500', bgColor: 'bg-slate-500/10', textColor: 'text-slate-400' },
  { name: 'Reports & Analytics', desc: 'Aggregated building insights & reports', icon: BarChart3, route: '/reports', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', textColor: 'text-violet-400' },
  { name: 'Alerts & Notifications', desc: 'Building alerts & threshold monitoring', icon: Bell, route: '/alerts', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { name: 'Activity Log', desc: 'Audit trail & user activity tracking', icon: ClipboardList, route: '/activity', color: 'from-lime-500 to-green-500', bgColor: 'bg-lime-500/10', textColor: 'text-lime-400' },
  { name: 'Building Settings', desc: 'Configuration & system preferences', icon: Settings, route: '/settings', color: 'from-gray-400 to-slate-500', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' },
  { name: 'User Profile', desc: 'Manage your account & password', icon: UserCircle, route: '/profile', color: 'from-sky-500 to-blue-500', bgColor: 'bg-sky-500/10', textColor: 'text-sky-400' },
]

const stats = [
  { label: 'Active Systems', value: '24', icon: Activity, color: 'text-green-400' },
  { label: 'Efficiency', value: '94%', icon: TrendingUp, color: 'text-blue-400' },
  { label: 'Active Alerts', value: '3', icon: Bell, color: 'text-yellow-400' },
  { label: 'Occupants', value: '847', icon: Users, color: 'text-purple-400' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {} } catch { return {} }
  })()

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user.name || 'Admin'}</span>
          </h1>
          <p className="text-dark-400 mt-1">Here is your building management overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <h2 className="text-xl font-semibold text-white mb-4">Building Systems</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => navigate(feature.route)}
              className="bg-dark-800 border border-dark-700 rounded-xl p-5 cursor-pointer card-hover group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className={feature.textColor} />
              </div>
              <h3 className="text-white font-semibold mb-1">{feature.name}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              <div className="mt-3 flex items-center text-sm text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View details
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
