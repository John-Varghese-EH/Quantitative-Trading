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


import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Search, Sun, Moon, PanelLeftClose, PanelLeft, Menu, Settings, Shield, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/currency'
import axios from 'axios'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function TopBar() {
  const { unreadCount, sidebarOpen, setSidebarOpen, currency, setCurrency, fetchRates } = useAppStore()
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const delay = setTimeout(() => {
      setIsSearching(true)
      axios.get(`/api/market/search?q=${searchQuery}`)
        .then(r => setSearchResults(r.data.results || []))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false))
    }, 300)
    return () => clearTimeout(delay)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  const [watchlist, setWatchlist] = useState<string[]>([])

  useEffect(() => {
    if (user?.uid) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) {
          setWatchlist(snap.data().watchlist || [])
        }
      })
    }
  }, [user?.uid])

  const { data: prices } = useQuery({
    queryKey: ['live-prices', watchlist],
    queryFn: () => axios.get(`/api/market/live-prices${watchlist.length ? `?symbols=${watchlist.join(',')}` : ''}`).then(r => r.data.prices),
    refetchInterval: 30_000,
  })

  return (
    <header style={{
      position: 'fixed', top: 0, right: 0, height: 'var(--topbar-height)',
      left: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      zIndex: 99,
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      transition: 'left 0.25s ease',
    }} className="topbar-header">
      {/* Desktop sidebar toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sidebar-toggle-desktop"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 6, borderRadius: 6
        }}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>
      {/* Mobile hamburger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sidebar-toggle-mobile"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--color-text)', display: 'none', alignItems: 'center', justifyContent: 'center',
          padding: 6, borderRadius: 6
        }}
      >
        <Menu size={22} />
      </button>

      {/* Live Ticker */}
      <div className="ticker-wrapper" style={{ flex: 1, maxWidth: 600 }}>
        {prices && (
          <div className="ticker-content" style={{ gap: 32, display: 'flex' }}>
            {[...prices, ...prices].map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.symbol}</span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {formatCurrency(p.price, currency)}
                </span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '0.75rem' }}>
                  {p.positive ? '+' : ''}{p.change_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div ref={dropdownRef} style={{ position: 'relative', width: 280, marginLeft: 'auto' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: 12 }} />
          <input 
            type="text" 
            placeholder="Search markets..." 
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowDropdown(true)
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '6px 16px 6px 36px',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (searchQuery.trim() !== '') && (
          <div style={{
            position: 'absolute', top: 40, left: 0, right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            maxHeight: 300,
            overflowY: 'auto',
          }}>
            {isSearching ? (
              <div style={{ padding: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((res: any, idx: number) => (
                <div key={idx} style={{
                  padding: '10px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid var(--color-glass-border)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-glass-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{res.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{res.name}</div>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{res.type}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>No results found.</div>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-muted)'
          }}
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Currency Selector */}
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value as any)}
          className="premium-select"
          style={{ width: 80 }}
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>

        {/* Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--color-muted)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--color-danger)',
              color: '#fff', fontSize: '0.6rem', fontWeight: 700,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unreadCount}</span>
          )}
        </div>

        {/* User profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 8, padding: '4px 10px',
              fontSize: '0.85rem', cursor: 'pointer',
              color: 'var(--color-text)'
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text)',
              }}>
                {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span>{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
          </button>
          
          {profileOpen && (
            <div style={{
              position: 'absolute', top: 44, right: 0, width: 200,
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: 8, zIndex: 100
            }}>
              <NextLink href="/settings" className="sidebar-link" style={{ margin: 0, padding: '8px 12px' }} onClick={() => setProfileOpen(false)}>
                <Settings size={16} /> Settings
              </NextLink>
              {(user as any)?.role === 'admin' && (
                <NextLink href="/admin" className="sidebar-link" style={{ margin: 0, padding: '8px 12px' }} onClick={() => setProfileOpen(false)}>
                  <Shield size={16} /> Admin Panel
                </NextLink>
              )}
              <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
              <button 
                onClick={async () => {
                  setProfileOpen(false)
                  await logout()
                  router.push('/login')
                }}
                className="sidebar-link" 
                style={{ margin: 0, padding: '8px 12px', width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: 'var(--color-danger)' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
