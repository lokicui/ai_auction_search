import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import { login, register } from '../services/api'
import { saveAuth } from '../services/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async ({ username, password, role, isRegister }) => {
    setError('')
    setLoading(true)
    try {
      const res = isRegister
        ? await register(username, password, role)
        : await login(username, password)
      saveAuth(res.data)
      navigate(res.data.role === 'admin' ? '/admin' : '/chat')
    } catch (err) {
      setError(err.response?.data?.detail || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
}
