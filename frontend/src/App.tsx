import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import MapCatalog from './pages/MapCatalog'
import Dashboard from './pages/Dashboard'
import { LogoutButton } from './components/LogoutButton'
import './styles/App.css'

const queryClient = new QueryClient()

// 認証済みユーザー向けのルート
function AuthenticatedApp() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <LogoutButton />
        </header>
        <Routes>
          <Route path="/" element={<MapCatalog />} />
          <Route path="/map/:mapId" element={<Dashboard />} />
        </Routes>
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
