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
import { Bell, Search, Sun, Moon, PanelLeftClose, PanelLeft, Settings, Shield, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/currency'
import api from '@/services/api'
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
  const [searchFocused, setSearchFocused] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const delay = setTimeout(() => {
      setIsSearching(true)
      api.get(`/market/search?q=${searchQuery}`)
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
        setSearchFocused(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
    queryFn: () => api.get(`/market/live-prices${watchlist.length ? `?symbols=${watchlist.join(',')}` : ''}`).then(r => r.data.prices),
    refetchInterval: 30_000,
  })

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()

  return (
    <header className="topbar-header" style={{
      position: 'fixed', top: 0, right: 0, height: 'var(--topbar-height)',
      left: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
      background: 'var(--color-glass)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--color-glass-border)',
      zIndex: 99,
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
      transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>

      {/* Desktop sidebar toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="sidebar-toggle-desktop topbar-icon-btn"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>

      {/* Live Ticker – desktop only */}
      <div className="ticker-wrapper" style={{ flex: 1, minWidth: 0 }}>
        {prices && (
          <div className="ticker-content" style={{ gap: 28, display: 'flex' }}>
            {[...prices, ...prices].map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{p.symbol}</span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(p.price, currency)}
                </span>
                <span style={{ 
                  color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', 
                  fontSize: '0.7rem',
                  background: p.positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  fontWeight: 600,
                }}>
                  {p.positive ? '+' : ''}{p.change_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>

        {/* Search Bar – desktop */}
        <div ref={dropdownRef} className="topbar-search-wrapper">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ 
              position: 'absolute', left: 10, 
              color: searchFocused ? 'var(--color-accent)' : 'var(--color-muted)',
              transition: 'color 0.2s'
            }} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search markets..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => {
                setSearchFocused(true)
                if (searchQuery.trim()) setShowDropdown(true)
              }}
              onBlur={() => setSearchFocused(false)}
              className="topbar-search-input"
            />
            {/* Keyboard shortcut hint */}
            {!searchFocused && !searchQuery && (
              <div className="topbar-search-kbd">
                <kbd>⌘</kbd><kbd>K</kbd>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showDropdown && (searchQuery.trim() !== '') && (
              <motion.div 
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="topbar-search-dropdown"
              >
                {isSearching ? (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    <div className="spinner" style={{ width: 20, height: 20, margin: '0 auto 8px', borderWidth: 2 }} />
                    Searching…
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((res: any, idx: number) => (
                    <div key={idx} className="topbar-search-result">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.symbol}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</div>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: '0.6rem', flexShrink: 0 }}>{res.type}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-muted)' }}>No results found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Currency Selector */}
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value as any)}
          className="premium-select topbar-currency-select"
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="topbar-icon-btn"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="topbar-icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="topbar-notif-badge">{unreadCount}</span>
          )}
        </button>

        {/* Divider – desktop only */}
        <div className="topbar-divider" />

        {/* User Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="topbar-profile-btn"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="topbar-avatar" />
            ) : (
              <div className="topbar-avatar-fallback">
                {avatarLetter}
              </div>
            )}
            <span className="topbar-profile-name">{displayName}</span>
            <ChevronDown size={14} style={{ 
              color: 'var(--color-muted)', 
              transition: 'transform 0.2s',
              transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }} />
          </button>
          
          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="topbar-profile-dropdown"
              >
                {/* User info header */}
                <div className="topbar-dropdown-header">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div className="topbar-avatar-fallback" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                      {avatarLetter}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                </div>

                <div className="topbar-dropdown-divider" />

                <NextLink href="/settings" className="topbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                  <Settings size={15} /> Settings
                </NextLink>
                {(user as any)?.role === 'admin' && (
                  <NextLink href="/admin" className="topbar-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Shield size={15} /> Admin Panel
                  </NextLink>
                )}
                
                <div className="topbar-dropdown-divider" />

                <button 
                  onClick={async () => {
                    setProfileOpen(false)
                    await logout()
                    router.push('/login')
                  }}
                  className="topbar-dropdown-item topbar-dropdown-danger"
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
