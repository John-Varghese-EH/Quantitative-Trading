import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import MarketDataPage from './pages/MarketDataPage'
import AIPredictionPage from './pages/AIPredictionPage'
import TradingSimulatorPage from './pages/TradingSimulatorPage'
import AdversarialPage from './pages/AdversarialPage'
import DefensePage from './pages/DefensePage'
import SandboxPage from './pages/SandboxPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ExplainableAIPage from './pages/ExplainableAIPage'
import AdminPage from './pages/AdminPage'
import NotificationsPage from './pages/NotificationsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="market" element={<MarketDataPage />} />
        <Route path="ai-prediction" element={<AIPredictionPage />} />
        <Route path="trading" element={<TradingSimulatorPage />} />
        <Route path="adversarial" element={<AdversarialPage />} />
        <Route path="defense" element={<DefensePage />} />
        <Route path="sandbox" element={<SandboxPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="explainable-ai" element={<ExplainableAIPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
