import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { Home } from './pages/Home'
import { LoginPage } from './pages/Login'
import { BackofficePage } from './pages/BackofficePage'
import { TeacherPage } from './pages/TeacherPage'
import { StudentPage } from './pages/StudentPage'
import { AdminPage } from './pages/AdminPage'
import { ParentPage } from './pages/ParentPage'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth roles={['admin']}>
                  <AdminPage />
                </RequireAuth>
              }
            />
            <Route
              path="/backoffice"
              element={
                <RequireAuth roles={['backoffice', 'admin']}>
                  <BackofficePage />
                </RequireAuth>
              }
            />
            <Route
              path="/docente/*"
              element={
                <RequireAuth roles={['docente', 'admin']}>
                  <TeacherPage />
                </RequireAuth>
              }
            />
            <Route
              path="/estudiante/*"
              element={
                <RequireAuth roles={['estudiante', 'admin']}>
                  <StudentPage />
                </RequireAuth>
              }
            />
            <Route
              path="/padres"
              element={
                <RequireAuth roles={['padre', 'admin']}>
                  <ParentPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
