import { createContext, useContext, useReducer, ReactNode } from 'react'

interface RenderClient {
  id: string
  name: string
  progress: number
  status: 'idle' | 'rendering' | 'paused'
  customParams?: Record<string, any> // Allows adding new dynamic properties
}

type Action =
  | { type: 'TOGGLE_RENDERING'; id: string }
  | { type: 'UPDATE_PROGRESS'; id: string; progress: number }
  | { type: 'ADD_CLIENT'; client: RenderClient }

const RenderNodeContext = createContext<{ clients: RenderClient[]; dispatch: React.Dispatch<Action> } | undefined>(
  undefined
)

const reducer = (state: RenderClient[], action: Action): RenderClient[] => {
  switch (action.type) {
    case 'TOGGLE_RENDERING':
      return state.map(client =>
        client.id === action.id
          ? { ...client, status: client.status === 'rendering' ? 'paused' : 'rendering' }
          : client
      )
    case 'UPDATE_PROGRESS':
      return state.map(client =>
        client.id === action.id ? { ...client, progress: action.progress } : client
      )
    case 'ADD_CLIENT':
      return [...state, action.client]
    default:
      return state
  }
}

export const RenderNodeProvider = ({ children }: { children: ReactNode }) => {
  const [clients, dispatch] = useReducer(reducer, [
    { id: '1', name: 'Render Node 1', progress: 45, status: 'rendering' },
    { id: '2', name: 'Render Node 2', progress: 0, status: 'idle' },
    { id: '3', name: 'Render Node 3', progress: 78, status: 'paused' },
  ])

  return <RenderNodeContext.Provider value={{ clients, dispatch }}>{children}</RenderNodeContext.Provider>
}

export const useRenderNodes = () => {
  const context = useContext(RenderNodeContext)
  if (!context) throw new Error('useRenderNodes must be used within a RenderNodeProvider')
  return context
}
