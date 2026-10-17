import { NavLink, Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from './pages/Home'
import { TrailsPage } from './pages/Trails'
import { LeetCodeHome } from './pages/LeetCodeHome'
import { PatternPage } from './pages/PatternPage'
import { ProblemPage } from './pages/ProblemPage'
import { ModuleSoon } from './pages/ModuleSoon'
import { toggleTheme, useTheme } from './lib/theme'
import { ErrorBoundary } from './components/ErrorBoundary'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // chaves obrigatórias: em navegadores novos scrollTo() retorna uma Promise,
    // e o React exige que o useEffect retorne só uma função (ou nada)
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const theme = useTheme()
  const { pathname } = useLocation()
  const wide = pathname.startsWith('/leetcode/p/')
  return (
    <div className="app">
      <ScrollTop />
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-logo">{'</>'}</span>
          <span className="brand-name">DevForge</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Vitrine
          </NavLink>
          <NavLink to="/trilhas">Trilhas</NavLink>
          <NavLink to="/leetcode">LeetCode</NavLink>
        </nav>
        <div className="topbar-right">
          <button className="icon-btn" onClick={toggleTheme} title="Alternar tema" aria-label="Alternar tema">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className={wide ? 'page page-wide' : 'page'}>
        <ErrorBoundary resetKey={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trilhas" element={<TrailsPage />} />
          <Route path="/leetcode" element={<LeetCodeHome />} />
          <Route path="/leetcode/padrao/:id" element={<PatternPage />} />
          <Route path="/leetcode/p/:id" element={<ProblemPage />} />
          <Route path="/modulo/:id" element={<ModuleSoon />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h2>Página não encontrada</h2>
                <Link to="/">Voltar para a vitrine</Link>
              </div>
            }
          />
        </Routes>
        </ErrorBoundary>
      </main>
    </div>
  )
}
