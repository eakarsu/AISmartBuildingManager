import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import HVACPage from './pages/HVACPage'
import LightingPage from './pages/LightingPage'
import ClimatePage from './pages/ClimatePage'
import MaintenancePage from './pages/MaintenancePage'
import EnergyPage from './pages/EnergyPage'
import ComfortPage from './pages/ComfortPage'
import SecurityPage from './pages/SecurityPage'
import SpacePage from './pages/SpacePage'
import WaterPage from './pages/WaterPage'
import ParkingPage from './pages/ParkingPage'
import VisitorPage from './pages/VisitorPage'
import WastePage from './pages/WastePage'
import FireSafetyPage from './pages/FireSafetyPage'
import ElevatorPage from './pages/ElevatorPage'
import AlertsPage from './pages/AlertsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ActivityPage from './pages/ActivityPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/hvac" element={<ProtectedRoute><HVACPage /></ProtectedRoute>} />
        <Route path="/lighting" element={<ProtectedRoute><LightingPage /></ProtectedRoute>} />
        <Route path="/climate" element={<ProtectedRoute><ClimatePage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/energy" element={<ProtectedRoute><EnergyPage /></ProtectedRoute>} />
        <Route path="/comfort" element={<ProtectedRoute><ComfortPage /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        <Route path="/space" element={<ProtectedRoute><SpacePage /></ProtectedRoute>} />
        <Route path="/water" element={<ProtectedRoute><WaterPage /></ProtectedRoute>} />
        <Route path="/parking" element={<ProtectedRoute><ParkingPage /></ProtectedRoute>} />
        <Route path="/visitors" element={<ProtectedRoute><VisitorPage /></ProtectedRoute>} />
        <Route path="/waste" element={<ProtectedRoute><WastePage /></ProtectedRoute>} />
        <Route path="/fire" element={<ProtectedRoute><FireSafetyPage /></ProtectedRoute>} />
        <Route path="/elevators" element={<ProtectedRoute><ElevatorPage /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
