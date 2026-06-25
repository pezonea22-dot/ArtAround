import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import OnboardingPage from './pages/OnboardingPage'
import VisitsPage from './pages/VisitsPage'
import VisitPage from './pages/VisitPage'
import './index.css'

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/visit/:id" element={<VisitPage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}