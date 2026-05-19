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
import BuildingHealthPage from './pages/BuildingHealthPage'
import ThresholdAlertsPage from './pages/ThresholdAlertsPage'
import MaintenancePredictionPage from './pages/MaintenancePredictionPage'
import EnergyOptimizerPage from './pages/EnergyOptimizerPage'
import OccupancyOptimizationPage from './pages/OccupancyOptimizationPage'
import PredictiveMaintenanceAIPage from './pages/PredictiveMaintenanceAIPage'
import SecurityAnomalyPage from './pages/SecurityAnomalyPage'
import EnergyForecastPage from './pages/EnergyForecastPage'
import ComfortOptimizationPage from './pages/ComfortOptimizationPage'
import WaterUsageOptimizationPage from './pages/WaterUsageOptimizationPage'
import CustomViewsPage from './pages/CustomViewsPage'

// === Batch 07 Gaps & Frontend Mounts ===
import CfWholebuildingEnergyOptimization from './pages/CfWholebuildingEnergyOptimization';
import CfThermalComfortPrediction from './pages/CfThermalComfortPrediction';
import CfPredictiveMaintenanceEngine from './pages/CfPredictiveMaintenanceEngine';
import CfAnomalyDetectionForSecurity from './pages/CfAnomalyDetectionForSecurity';
import CfOccupancydrivenDemandResponse from './pages/CfOccupancydrivenDemandResponse';
import CfWaterWasteOptimization from './pages/CfWaterWasteOptimization';
import GapNoOccupancyoptimizationHvaclightingAutotu from './pages/GapNoOccupancyoptimizationHvaclightingAutotu';
import GapNoPredictivemaintenanceFailurePrediction from './pages/GapNoPredictivemaintenanceFailurePrediction';
import GapNoEnergyforecastAi from './pages/GapNoEnergyforecastAi';
import GapNoComfortoptimizationEnergyVsComfort from './pages/GapNoComfortoptimizationEnergyVsComfort';
import GapNoSecurityanomalydetection from './pages/GapNoSecurityanomalydetection';
import GapNoWaterusageoptimizationLeakDetection from './pages/GapNoWaterusageoptimizationLeakDetection';
import GapNoRealtimeBuildingDashboardRouteStubsO from './pages/GapNoRealtimeBuildingDashboardRouteStubsO';
import GapNoIotDeviceProtocolIntegrationBacnetMo from './pages/GapNoIotDeviceProtocolIntegrationBacnetMo';
import GapNoOccupantMobileAppEndpoints from './pages/GapNoOccupantMobileAppEndpoints';
import GapNoTenantSubmeteringBillback from './pages/GapNoTenantSubmeteringBillback';
import GapLimitedEmergencyResponseWorkflows from './pages/GapLimitedEmergencyResponseWorkflows';
import GapNoVendorManagementContractors from './pages/GapNoVendorManagementContractors';
import GapNoDemandresponseGridIntegration from './pages/GapNoDemandresponseGridIntegration';
// === End Batch 07 ===


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
        <Route path="/building-health" element={<ProtectedRoute><BuildingHealthPage /></ProtectedRoute>} />
        <Route path="/threshold-alerts" element={<ProtectedRoute><ThresholdAlertsPage /></ProtectedRoute>} />
        <Route path="/maintenance-prediction" element={<ProtectedRoute><MaintenancePredictionPage /></ProtectedRoute>} />
        <Route path="/energy-optimizer" element={<ProtectedRoute><EnergyOptimizerPage /></ProtectedRoute>} />
        <Route path="/occupancy-optimization" element={<ProtectedRoute><OccupancyOptimizationPage /></ProtectedRoute>} />
        <Route path="/predictive-maintenance-ai" element={<ProtectedRoute><PredictiveMaintenanceAIPage /></ProtectedRoute>} />
        <Route path="/security-anomaly" element={<ProtectedRoute><SecurityAnomalyPage /></ProtectedRoute>} />
        <Route path="/energy-forecast" element={<ProtectedRoute><EnergyForecastPage /></ProtectedRoute>} />
        <Route path="/comfort-optimization" element={<ProtectedRoute><ComfortOptimizationPage /></ProtectedRoute>} />
        <Route path="/water-usage-optimization" element={<ProtectedRoute><WaterUsageOptimizationPage /></ProtectedRoute>} />
          {/* === Batch 07 Gaps & Frontend Mounts === */}
          <Route path='/cf-wholebuilding-energy-optimization' element={<CfWholebuildingEnergyOptimization />} />
          <Route path='/cf-thermal-comfort-prediction' element={<CfThermalComfortPrediction />} />
          <Route path='/cf-predictive-maintenance-engine' element={<CfPredictiveMaintenanceEngine />} />
          <Route path='/cf-anomaly-detection-for-security' element={<CfAnomalyDetectionForSecurity />} />
          <Route path='/cf-occupancydriven-demand-response' element={<CfOccupancydrivenDemandResponse />} />
          <Route path='/cf-water-waste-optimization' element={<CfWaterWasteOptimization />} />
          <Route path='/gap-no-occupancyoptimization-hvaclighting-autotu' element={<GapNoOccupancyoptimizationHvaclightingAutotu />} />
          <Route path='/gap-no-predictivemaintenance-failure-prediction' element={<GapNoPredictivemaintenanceFailurePrediction />} />
          <Route path='/gap-no-energyforecast-ai' element={<GapNoEnergyforecastAi />} />
          <Route path='/gap-no-comfortoptimization-energy-vs-comfort' element={<GapNoComfortoptimizationEnergyVsComfort />} />
          <Route path='/gap-no-securityanomalydetection' element={<GapNoSecurityanomalydetection />} />
          <Route path='/gap-no-waterusageoptimization-leak-detection' element={<GapNoWaterusageoptimizationLeakDetection />} />
          <Route path='/gap-no-realtime-building-dashboard-route-stubs-o' element={<GapNoRealtimeBuildingDashboardRouteStubsO />} />
          <Route path='/gap-no-iot-device-protocol-integration-bacnet-mo' element={<GapNoIotDeviceProtocolIntegrationBacnetMo />} />
          <Route path='/gap-no-occupant-mobile-app-endpoints' element={<GapNoOccupantMobileAppEndpoints />} />
          <Route path='/gap-no-tenant-submetering-billback' element={<GapNoTenantSubmeteringBillback />} />
          <Route path='/gap-limited-emergency-response-workflows' element={<GapLimitedEmergencyResponseWorkflows />} />
          <Route path='/gap-no-vendor-management-contractors' element={<GapNoVendorManagementContractors />} />
          <Route path='/gap-no-demandresponse-grid-integration' element={<GapNoDemandresponseGridIntegration />} />
          {/* === End Batch 07 === */}
          <Route path="/custom-views" element={<ProtectedRoute><CustomViewsPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
