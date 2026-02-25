import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn, getUser, clearAuth } from './services/auth'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import AssetDetailPage from './pages/AssetDetailPage'
import AdminPage from './pages/AdminPage'

function Nav() {
  const location = useLocation()
  const user = getUser()
  if (!isLoggedIn()) return null

  const isChat = location.pathname === '/chat'
  const isAdmin = location.pathname === '/admin'

  return (
    <nav className="h-14 bg-slate-900 text-white flex items-center px-6 gap-4">
      <span className="text-lg font-bold mr-4">🔍 AI拍卖搜索</span>

      <Link to="/chat" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
        isChat ? 'bg-blue-600' : 'hover:bg-slate-700'
      }`}>💬 智能搜索</Link>

      {user?.role === 'admin' && (
        <Link to="/admin" className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
          isAdmin ? 'bg-blue-600' : 'hover:bg-slate-700'
        }`}>📦 资产管理</Link>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-gray-300">{user?.username}</span>
        <button onClick={() => { clearAuth(); window.location.href = '/login' }}
          className="text-sm text-gray-400 hover:text-white transition-colors">退出</button>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/asset/:id" element={<ProtectedRoute><AssetDetailPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
