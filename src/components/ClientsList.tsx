import { useEffect, useState } from 'react'
import { Circle } from 'lucide-react'

interface Client {
  id: string
  name: string
  status: 'online' | 'offline' | 'rendering'
  isMain: boolean
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    // Simulate clients data
    const mockClients: Client[] = [
      { id: '1', name: 'Main Workstation', status: 'online', isMain: true },
      { id: '2', name: 'Render Node 1', status: 'rendering', isMain: false },
      { id: '3', name: 'Render Node 2', status: 'online', isMain: false },
      { id: '4', name: 'Render Node 3', status: 'offline', isMain: false },
    ]
    setClients(mockClients)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'rendering':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Connected Clients</h2>
      <div className="grid gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <Circle
                className={`h-3 w-3 ${getStatusColor(client.status)}`}
                fill="currentColor"
              />
              <div>
                <h3 className="font-semibold">
                  {client.name}
                  {client.isMain && (
                    <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">
                      MAIN
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-400 capitalize">{client.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClientsList
