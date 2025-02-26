import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

const ThemeToggle = ({ isDark, onToggle }: ThemeToggleProps) => {
  const [showAnimation, setShowAnimation] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const button = document.getElementById('theme-toggle')
    if (button) {
      const rect = button.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      })
    }

    setShowAnimation(true)
    const timer = setTimeout(() => setShowAnimation(false), 500)
    return () => clearTimeout(timer)
  }, [isDark])

  return (
    <>
      <button
        id="theme-toggle"
        onClick={onToggle}
        className="relative inline-flex h-7 w-14 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200"
      >
        <div
          className={`absolute left-1 flex h-5 w-5 transform items-center justify-center rounded-full bg-[#b4d6fa] dark:bg-white shadow-lg transition-all duration-500 ease-in-out ${
            isDark ? 'translate-x-7' : 'translate-x-0'
          }`}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-gray-700" />
          ) : (
            <Sun className="h-4 w-4 text-yellow-500" />
          )}
        </div>

        {!isDark && (
          <div className="absolute inset-0 pointer-events-none translate-x-[-10px] translate-y-[-10px]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 h-8 w-0.5 origin-bottom"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              >
                <div className="absolute top-0 h-full w-full bg-yellow-500/50 animate-ray-expand" />
              </div>
            ))}
          </div>
        )}

        {isDark && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 bg-yellow-200 rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}
      </button>
      
      {showAnimation && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            zIndex: 100
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                '--tx': `${Math.cos(i * Math.PI / 4) * 40}px`,
                '--ty': `${Math.sin(i * Math.PI / 4) * 40}px`,
                width: '12px',
                height: '12px',
                backgroundColor: isDark ? '#ffd700' : '#ffd700',
                position: 'absolute',
                left: '-6px',
                top: '-6px',
                transform: 'translate(var(--tx), var(--ty)) rotate(45deg)',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                animation: 'star-burst 0.5s ease-out forwards',
                animationDelay: `${i * 0.05}s`,
                opacity: 0
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default ThemeToggle
