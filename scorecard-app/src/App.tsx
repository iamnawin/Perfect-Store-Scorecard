import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { EntryScreen } from './screens/EntryScreen'
import { ChecklistScreen } from './screens/ChecklistScreen'
import { OffShelfScreen } from './screens/OffShelfScreen'
import { PhotoScreen } from './screens/PhotoScreen'
import { SummaryScreen } from './screens/SummaryScreen'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<EntryScreen />} />
          <Route path="/checklist" element={<ChecklistScreen />} />
          <Route path="/off-shelf" element={<OffShelfScreen />} />
          <Route path="/photo" element={<PhotoScreen />} />
          <Route path="/summary" element={<SummaryScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
