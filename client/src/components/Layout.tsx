import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="main-layout" style={{ flex: 1 }}>
        <TopBar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
