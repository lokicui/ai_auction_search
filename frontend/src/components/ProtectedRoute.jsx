import { Navigate } from 'react-router-dom'
import { isLoggedIn, getUser } from '../services/auth'

export default function ProtectedRoute({ children, role }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (role) {
    const user = getUser()
    if (user?.role !== role) return <Navigate to="/login" replace />
  }
  return children
}
