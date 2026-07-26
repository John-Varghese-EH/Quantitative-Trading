import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: 'user' | 'admin'
  is_verified: boolean
  avatar_url?: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

interface AppState {
  // Auth
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  
  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void
  
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => void
  markAllRead: () => void
  
  // Active model
  activeModelId: string | null
  setActiveModelId: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        set({ user, accessToken, isAuthenticated: true })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      // Theme
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Notifications
      notifications: [],
      unreadCount: 0,
      addNotification: (n) => {
        const notif: Notification = {
          ...n,
          id: Date.now().toString(),
          is_read: false,
          created_at: new Date().toISOString(),
        }
        set((s) => ({
          notifications: [notif, ...s.notifications].slice(0, 50),
          unreadCount: s.unreadCount + 1,
        }))
      },
      markAllRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      })),

      // Active model
      activeModelId: null,
      setActiveModelId: (id) => set({ activeModelId: id }),
    }),
    {
      name: 'quantadv-store',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated, theme: s.theme }),
    }
  )
)
