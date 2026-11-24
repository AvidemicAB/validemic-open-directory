import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import OpenHome from './pages/open/OpenHome'
import OpenTool from './pages/open/OpenTool'
import OpenMethodology from './pages/open/OpenMethodology'
import OpenUniversities from './pages/open/OpenUniversities'
import OpenCompare from './pages/open/OpenCompare'
import OpenLaw from './pages/open/OpenLaw'
import OpenLawReader from './pages/open/OpenLawReader'
import NotFound from './pages/NotFound'

const SITE = 'https://validemic.com'

/** Anything outside the directory is part of Validemic's workspace. */
function Elsewhere() {
  const { pathname, search } = useLocation()
  const product = !pathname.startsWith('/open')
  useEffect(() => {
    if (product) window.location.href = `${SITE}/#${pathname}${search}`
  }, [product, pathname, search])
  return product ? null : <NotFound />
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<OpenHome />} />
        <Route path="/open" element={<OpenHome />} />
        <Route path="/open/tools/:id" element={<OpenTool />} />
        <Route path="/open/universities" element={<OpenUniversities />} />
        <Route path="/open/compare" element={<OpenCompare />} />
        <Route path="/open/methodology" element={<OpenMethodology />} />
        <Route path="/open/law/:law" element={<OpenLaw />} />
        <Route path="/open/law/:law/read" element={<OpenLawReader />} />
        <Route path="*" element={<Elsewhere />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
