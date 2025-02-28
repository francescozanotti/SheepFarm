import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';

interface Client {
  hostname: string;
  connected: boolean;
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5173');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'clientList') {
        setClients(data.clients);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-500' : 'text-gray-500';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Connected Clients</h2>
      <div className="grid gap-4">
        {clients.map((client) => (
          <div
            key={client.hostname}
            className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <Circle
                className={`h-3 w-3 ${getStatusColor(client.connected)}`}
                fill="currentColor"
              />
              <div>
                <h3 className="font-semibold">{client.hostname}</h3>
                <p className="text-sm text-gray-400 capitalize">
                  {client.connected ? 'online' : 'offline'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsList;
