import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LayoutGrid, LogOut, Users } from 'lucide-react'
import ClientsList from './ClientsList'
import RenderUISimple from './RenderUISimple'
import RenderUIAdvanced from './RenderUIAdvanced'

interface DashboardProps {
  onLogout: () => void
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [renderMode, setRenderMode] = useState<'simple' | 'advanced'>('simple')
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname.split('/').pop()
  const showRender = currentPath === 'render'
  const showClients = currentPath === 'clients'

  const handleNavigation = (path: string) => {
    navigate(`/dashboard/${path}`)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-gray-100 dark:bg-[#2a2a2a] p-4 flex flex-col shadow-lg">
        <div className="flex items-center justify-center mb-8">
          <h1 className="hidden md:block text-xl font-bold text-blue-500">Render Farm</h1>
        </div>
        
        <nav className="flex-1">
          <button
            onClick={() => handleNavigation('clients')}
            className={`flex items-center p-3 rounded-lg mb-2 w-full ${
              showClients ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-[#333]'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="hidden md:inline ml-3">Connected Clients</span>
          </button>

          <button
            onClick={() => handleNavigation('render')}
            className={`flex items-center p-3 rounded-lg mb-2 w-full ${
              showRender ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-[#333]'
            }`}
          >
            {renderMode === 'simple' ? (
              <LayoutDashboard className="h-5 w-5" />
            ) : (
              <LayoutGrid className="h-5 w-5" />
            )}
            <span className="hidden md:inline ml-3">Render Manager</span>
          </button>

          <div className="hidden md:block p-3">
            <label className="flex items-center space-x-2">
              <span>Render UI Mode:</span>
              <select
                value={renderMode}
                onChange={(e) => setRenderMode(e.target.value as 'simple' | 'advanced')}
                className="bg-gray-200 dark:bg-[#333] border rounded p-1"
              >
                <option value="simple">Simple</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center p-3 text-red-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline ml-3">Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showClients && <ClientsList />}
        {showRender && (renderMode === 'simple' ? <RenderUISimple /> : <RenderUIAdvanced />)}
      </div>
    </div>
  )
}

export default Dashboard
