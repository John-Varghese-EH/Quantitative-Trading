"use client";

import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, Search, TrendingUp, TrendingDown, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/store/useAppStore'
import api from '@/services/api'

export default function TopBar() {
  const { unreadCount, user } = useAppStore()
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: prices } = useQuery({
    queryKey: ['live-prices'],
    queryFn: () => api.get('/market/live-prices').then(r => r.data.prices),
    refetchInterval: 30_000,
  })

  return (
    <header style={{
      position: 'fixed', top: 0, left: 280, right: 0, height: 72,
      background: 'var(--color-glass)',
      backdropFilter: 'blur(30px)',
      borderBottom: '1px solid var(--color-glass-border)',
      zIndex: 99,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 32px',
      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Live Ticker */}
      <div className="ticker-wrapper" style={{ flex: 1, maxWidth: 600 }}>
        {prices && (
          <div className="ticker-content" style={{ gap: 32, display: 'flex' }}>
            {[...prices, ...prices].map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.symbol}</span>
                <span style={{ color: p.positive ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  ${p.price.toLocaleString()}
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
              background: 'var(--color-glass-light)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 20,
              padding: '8px 16px 8px 36px',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (searchQuery.trim() !== '') && (
          <div style={{
            position: 'absolute', top: 44, left: 0, right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 12,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
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

        {/* User pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-border)',
          borderRadius: 24, padding: '6px 14px',
          fontSize: '0.85rem',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ color: 'var(--color-text)' }}>{user?.username}</span>
          {user?.role === 'admin' && (
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>ADMIN</span>
          )}
        </div>
      </div>
    </header>
  )
}
