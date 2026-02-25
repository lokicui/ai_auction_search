export default function ChatBubble({ role, children }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
        isUser ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-blue-500 text-white rounded-tr-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
      }`}>
        {children}
      </div>
    </div>
  )
}
