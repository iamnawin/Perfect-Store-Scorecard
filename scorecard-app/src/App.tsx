import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { VisitStartScreen } from './screens/VisitStartScreen'
import { ScorecardOverviewScreen } from './screens/ScorecardOverviewScreen'
import { BasePlanExecutionScreen } from './screens/BasePlanExecutionScreen'
import { BasePlanLgorScreen } from './screens/BasePlanLgorScreen'
import { IncrementalOffShelfScreen } from './screens/IncrementalOffShelfScreen'
import { OpportunityScreen } from './screens/OpportunityScreen'
import { RecommendationsScreen } from './screens/RecommendationsScreen'
import { ScoreSummaryScreen } from './screens/ScoreSummaryScreen'
import { RevisitFollowUpScreen } from './screens/RevisitFollowUpScreen'
import { ManagerDashboardScreen } from './screens/ManagerDashboardScreen'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<VisitStartScreen />} />
          <Route path="/scorecard" element={<ScorecardOverviewScreen />} />
          <Route path="/scorecard/base-plan" element={<BasePlanExecutionScreen />} />
          <Route path="/scorecard/base-plan-lgor" element={<BasePlanLgorScreen />} />
          <Route path="/scorecard/incremental" element={<IncrementalOffShelfScreen />} />
          <Route path="/scorecard/opportunity" element={<OpportunityScreen />} />
          <Route path="/scorecard/recommendations" element={<RecommendationsScreen />} />
          <Route path="/scorecard/summary" element={<ScoreSummaryScreen />} />
          <Route path="/scorecard/revisit" element={<RevisitFollowUpScreen />} />
          <Route path="/manager" element={<ManagerDashboardScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
