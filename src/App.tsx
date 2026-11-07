import { NavLink, Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from './pages/Home'
import { TrailsPage } from './pages/Trails'
import { CourseHome } from './pages/CourseHome'
import { UnitPage } from './pages/UnitPage'
import { COURSES } from './content/courses'
import { ProblemPage } from './pages/ProblemPage'
import { ModuleSoon } from './pages/ModuleSoon'
import { toggleTheme, useTheme } from './lib/theme'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GuidePage } from './pages/GuidePage'
import { ExamPage, ExamsPage } from './pages/ExamPage'
import { EXAM_COURSE } from './content/exams'
import { IFOOD } from './content/ifood'
import { IfoodHome } from './pages/ifood/IfoodHome'
import { IfoodSectionPage } from './pages/ifood/IfoodSectionPage'

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
  const wide = /^\/[^/]+\/p\/[^/]+$/.test(pathname)
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
          <NavLink to="/guia">Guia</NavLink>
          <NavLink to="/trilhas">Trilhas</NavLink>
          <NavLink to="/js">Fundamentos JS</NavLink>
          <NavLink to="/async">Async</NavLink>
          <NavLink to="/leetcode">LeetCode</NavLink>
          <NavLink to="/ifood">iFood GenAI</NavLink>
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
          <Route path="/guia" element={<GuidePage />} />
          <Route path="/provas" element={<ExamsPage />} />
          <Route path="/prova/:id" element={<ExamPage />} />
          <Route path="/provas/p/:id" element={<ProblemPage course={EXAM_COURSE} />} />
          <Route path={IFOOD.basePath} element={<IfoodHome />} />
          <Route path={`${IFOOD.basePath}/:section`} element={<IfoodSectionPage />} />
          {COURSES.flatMap((c) => [
            // o iFood tem página inicial própria (acima)
            ...(c.id === IFOOD.id ? [] : [<Route key={c.id} path={c.basePath} element={<CourseHome course={c} />} />]),
            <Route key={c.id + '-u'} path={`${c.basePath}/${c.unitSegment}/:id`} element={<UnitPage course={c} />} />,
            <Route key={c.id + '-p'} path={`${c.basePath}/p/:id`} element={<ProblemPage course={c} />} />,
          ])}
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
