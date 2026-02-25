import axios from 'axios'
import { getToken } from './auth'

const api = axios.create({ baseURL: '/api/v1' })

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const register = (username, password, role = 'vip') =>
  api.post('/auth/register', { username, password, role }).then(r => r.data)

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data)

// Chat
export async function streamChatMatch(userMessage, sessionId, callbacks) {
  const { onThinking, onAssets, onDone, onError } = callbacks
  const token = getToken()

  try {
    const response = await fetch('/api/v1/chat-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_message: userMessage, session_id: sessionId }),
    })

    if (!response.ok) {
      onError('服务异常，请稍后重试')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value)
      const lines = text.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          switch (data.type) {
            case 'thinking': onThinking(data.content); break
            case 'assets': onAssets(data.content); break
            case 'done': onDone(data.session_id); break
          }
        } catch { /* partial chunk */ }
      }
    }
  } catch (err) {
    onError(err.message || '网络错误')
  }
}

export const getSessions = () => api.get('/chat/sessions').then(r => r.data)
export const getHistory = (sessionId) => api.get(`/chat/history?session_id=${sessionId}`).then(r => r.data)

// Admin
export const uploadAssets = (file) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/admin/assets/upload', fd).then(r => r.data)
}

export const getAssets = (page = 1, pageSize = 10) =>
  api.get(`/admin/assets?page=${page}&page_size=${pageSize}`).then(r => r.data)

export const deleteAsset = (id) => api.delete(`/admin/assets/${id}`).then(r => r.data)
export const updateAsset = (id, data) => api.put(`/admin/assets/${id}`, data).then(r => r.data)
export const downloadTemplate = () => api.get('/admin/assets/template', { responseType: 'blob' })

export const getAssetDetail = (id) => api.get(`/assets/${id}`).then(r => r.data)
