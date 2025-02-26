import { useState } from 'react'
import { Play, Pause } from 'lucide-react'

interface RenderClient {
  id: string
  name: string
  progress: number
  status: 'idle' | 'rendering' | 'paused'
}

const RenderUISimple = () => {
  const [clients, setClients] = useState<RenderClient[]>([
    { id: '1', name: 'Render Node 1', progress: 45, status: 'rendering' },
    { id: '2', name: 'Render Node 2', progress: 0, status: 'idle' },
    { id: '3', name: 'Render Node 3', progress: 78, status: 'paused' },
  ])

  const toggleRendering = (id: string) => {
    setClients(clients.map(client => {
      if (client.id === id) {
        return {
          ...client,
          status: client.status === 'rendering' ? 'paused' : 'rendering'
        }
      }
      return client
    }))
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Simple Render Manager</h2>
      <div className="grid gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-[#2a2a2a] p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{client.name}</h3>
              <button
                onClick={() => toggleRendering(client.id)}
                className="p-2 hover:bg-[#333] rounded-full transition-colors"
              >
                {client.status === 'rendering' ? (
                  <Pause className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Play className="h-5 w-5 text-green-500" />
                )}
              </button>
            </div>
            <div className="h-2 bg-[#333] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${client.progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Progress: {client.progress}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RenderUISimple
