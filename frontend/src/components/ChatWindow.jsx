import { useState, useRef, useEffect } from 'react'
import ChatBubble from './ChatBubble'
import ThinkingChain from './ThinkingChain'
import AssetCardList from './AssetCardList'
import { streamChatMatch } from '../services/api'

const WELCOME = {
  role: 'assistant',
  type: 'text',
  content: '您好！我是AI拍卖搜索助手 🤖\n\n请描述您的购买需求，我会为您智能匹配合适的拍卖资产。\n\n例如：「杭州西湖区的别墅，1000万以内」',
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', type: 'text', content: text }])

    let thinkingLines = []
    let assetsData = []
    const thinkingId = Date.now()

    setMessages(prev => [...prev, { role: 'assistant', type: 'loading', id: thinkingId }])

    await streamChatMatch(text, sessionId, {
      onThinking(content) {
        const newLines = content.split('\n').filter(l => l.trim())
        thinkingLines = [...thinkingLines, ...newLines]
        setMessages(prev => prev.map(m =>
          m.id === thinkingId ? { ...m, type: 'thinking', thinkingLines: [...thinkingLines] } : m
        ))
      },
      onAssets(assets) {
        assetsData = assets
        setMessages(prev => prev.map(m =>
          m.id === thinkingId ? { ...m, assets: assets } : m
        ))
      },
      onDone(sid) {
        setSessionId(sid)
        setLoading(false)
      },
      onError(err) {
        setMessages(prev => prev.map(m =>
          m.id === thinkingId ? { ...m, type: 'error', content: err } : m
        ))
        setLoading(false)
      },
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h2 className="text-lg font-semibold text-gray-800">我要买</h2>
          <span className="text-sm text-gray-400">描述您的需求，AI为您匹配拍卖资产</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
        {messages.map((msg, i) => {
          if (msg.type === 'text' || msg.role === 'user') {
            return (
              <ChatBubble key={i} role={msg.role}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </ChatBubble>
            )
          }
          if (msg.type === 'loading') {
            return (
              <ChatBubble key={i} role="assistant">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="animate-spin">⏳</span> AI 正在分析您的需求...
                </div>
              </ChatBubble>
            )
          }
          if (msg.type === 'thinking') {
            return (
              <ChatBubble key={i} role="assistant">
                <ThinkingChain lines={msg.thinkingLines || []} />
                {msg.assets && <AssetCardList assets={msg.assets} />}
              </ChatBubble>
            )
          }
          if (msg.type === 'error') {
            return (
              <ChatBubble key={i} role="assistant">
                <div className="text-red-500 border border-red-200 rounded-lg p-3 bg-red-50">
                  ⚠️ {msg.content}
                  <button onClick={() => { setLoading(false) }}
                    className="ml-2 text-blue-500 hover:underline text-sm">重试</button>
                </div>
              </ChatBubble>
            )
          }
          return null
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-3 border-t bg-white">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
            placeholder="请描述您的购买需求，如：杭州西湖区带院子的别墅，1000万以内..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100" />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0">
            {loading ? '匹配中...' : '发送 ▶'}
          </button>
        </div>
      </div>
    </div>
  )
}
