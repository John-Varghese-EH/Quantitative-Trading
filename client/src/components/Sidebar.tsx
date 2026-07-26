import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, Brain, Zap, Shield, FlaskConical,
  BarChart3, Lightbulb, Bell, Settings, LogOut, ChevronLeft, Activity,
  Newspaper, Users
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/market',         label: 'Market Data',       icon: TrendingUp },
  { to: '/ai-prediction',  label: 'AI Prediction',     icon: Brain },
  { to: '/trading',        label: 'Trading Simulator', icon: Activity },
  { to: '/adversarial',    label: 'Adversarial ML',    icon: Zap },
  { to: '/defense',        label: 'Defense Module',    icon: Shield },
  { to: '/sandbox',        label: 'Sandbox',           icon: FlaskConical },
  { to: '/analytics',      label: 'Analytics',         icon: BarChart3 },
  { to: '/explainable-ai', label: 'Explainable AI',    icon: Lightbulb },
  { to: '/notifications',  label: 'Notifications',     icon: Bell },
]

export default function Sidebar() {
  const { user, clearAuth, unreadCount } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,212,255,0.4)',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }} className="gradient-text">QuantAdv</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>AI Trading Sandbox</div>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <NavLink
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === '/notifications' && unreadCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--color-danger)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 10,
                  minWidth: 18,
                  textAlign: 'center',
                }}>{unreadCount}</span>
              )}
            </NavLink>
          </motion.div>
        ))}

        {/* Admin only */}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
        <div className="glass-light" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: '#fff', flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', truncate: true }}>{user?.username}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4 }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
