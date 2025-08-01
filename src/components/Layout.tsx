import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">不如</Link>
          <nav className="main-nav">
            <Link 
              to="/memories" 
              className={location.pathname.startsWith('/memories') ? 'active' : ''}
            >
              回忆集
            </Link>
            <Link 
              to="/first-encounter"
              className={location.pathname === '/first-encounter' ? 'active' : ''}
            >
              重返初遇
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}