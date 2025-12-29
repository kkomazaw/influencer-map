import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { LogoutButton } from './components/LogoutButton'
import './styles/App.css'

// Lazy load page components for code splitting
const MapCatalog = lazy(() => import('./pages/MapCatalog'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

const queryClient = new QueryClient()

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="app-loading">
      <p>読み込み中...</p>
    </div>
  )
}

// 認証済みユーザー向けのルート
function AuthenticatedApp() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingFallback />
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <LogoutButton />
        </header>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MapCatalog />} />
            <Route path="/map/:mapId" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

// メインアプリコンポーネント
function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <p>読み込み中...</p>
      </div>
    )
  }

  return user ? <AuthenticatedApp /> : <Login />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
