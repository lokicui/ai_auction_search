import { useState, useEffect, useRef } from 'react'

export default function ThinkingChain({ lines }) {
  const [displayed, setDisplayed] = useState([])
  const indexRef = useRef(0)

  useEffect(() => {
    if (indexRef.current < lines.length) {
      const timer = setTimeout(() => {
        setDisplayed(prev => [...prev, lines[indexRef.current]])
        indexRef.current += 1
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [lines, displayed])

  return (
    <div className="space-y-1.5 py-1">
      {displayed.map((line, i) => (
        <div key={i} className="text-sm text-gray-600 animate-fade-in">
          {line}
        </div>
      ))}
      {indexRef.current < lines.length && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="animate-pulse">●</span> 分析中...
        </div>
      )}
    </div>
  )
}
