"use client";
/**
 * QuantAdv - Quantitative Trading Platform
 * Copyright (C) 2026 John Varghese (J0X)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Trash2, ToggleLeft, ToggleRight, Activity, Brain, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  })

  const { data: systemStats } = useQuery({
    queryKey: ['admin-system'],
    queryFn: () => api.get('/admin/system').then(r => r.data),
  })

  const { data: logs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => api.get('/admin/logs?limit=20').then(r => r.data.logs),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-active`),
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>
          Admin <span className="gradient-text">Panel</span>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>System management and monitoring</p>
      </motion.div>

      {/* System Stats */}
      {systemStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { l: 'Total Users', v: systemStats.total_users, icon: <Users size={18} color="#00d4ff" />, color: '#00d4ff' },
            { l: 'ML Models', v: systemStats.total_models, icon: <Brain size={18} color="#7c3aed" />, color: '#7c3aed' },
            { l: 'Total Trades', v: systemStats.total_trades, icon: <Activity size={18} color="#10b981" />, color: '#10b981' },
            { l: 'Total Attacks', v: systemStats.total_attacks, icon: <AlertTriangle size={18} color="#ef4444" />, color: '#ef4444' },
          ].map(s => (
            <div key={s.l} className="glass" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{s.l}</div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="var(--color-primary)" /> User Management
          <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 400, color: 'var(--color-muted)' }}>
            {users?.total || 0} users
          </span>
        </h3>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Verified</th><th>Last Login</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users?.users || []).map((u: any) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-cyan'}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>
                      {u.is_verified ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} className="text-success" /> Verified</span> : <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} className="text-muted" /> Pending</span>}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {u.role !== 'admin' && (
                        <>
                          <button onClick={() => toggleMutation.mutate(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.is_active ? 'var(--color-success)' : 'var(--color-muted)' }}>
                            {u.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          <button onClick={() => { if (confirm(`Delete user ${u.username}?`)) deleteMutation.mutate(u.id) }}
                            title="Delete user"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Activity Logs */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 700 }}>Recent Activity Logs</h3>
        <table className="data-table">
          <thead><tr><th>Action</th><th>IP Address</th><th>Time</th></tr></thead>
          <tbody>
            {(logs || []).map((l: any) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.action}</td>
                <td style={{ color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>{l.ip_address || '-'}</td>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                  {l.created_at ? new Date(l.created_at).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
