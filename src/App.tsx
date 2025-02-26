import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'
import { useEffect, useState } from 'react'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth === 'true') setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1a1a1a] dark:text-gray-100 transition-colors duration-200">
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        </div>
        <Routes>
          <Route 
            path="/login" 
            element={
              <Login 
                onLogin={() => {
                  setIsAuthenticated(true)
                  localStorage.setItem('isAuthenticated', 'true')
                }} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard 
                  onLogout={() => {
                    setIsAuthenticated(false)
                    localStorage.removeItem('isAuthenticated')
                  }}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route path="clients" element={<Navigate to="/dashboard/clients" replace />} />
            <Route path="render" element={<Navigate to="/dashboard/render" replace />} />
            <Route index element={<Navigate to="/dashboard/clients" replace />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
