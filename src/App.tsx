import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { PlacesPage } from './pages/PlacesPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="places" element={<PlacesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
    </Routes>
  )
}
