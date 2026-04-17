import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { EntryScreen } from './screens/EntryScreen'
import { ChecklistScreen } from './screens/ChecklistScreen'
import { OffShelfScreen } from './screens/OffShelfScreen'
import { PhotoScreen } from './screens/PhotoScreen'
import { SummaryScreen } from './screens/SummaryScreen'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    const scrollContainers = document.querySelectorAll<HTMLElement>('[data-scroll-to-top="true"]')
    scrollContainers.forEach(container => {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      } else {
        container.scrollTop = 0
        container.scrollLeft = 0
      }
    })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<EntryScreen />} />
          <Route path="/checklist" element={<Navigate to="/checklist/base-plan" replace />} />
          <Route path="/checklist/:sectionId" element={<ChecklistScreen />} />
          <Route path="/off-shelf" element={<OffShelfScreen />} />
          <Route path="/photo" element={<PhotoScreen />} />
          <Route path="/summary" element={<SummaryScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
