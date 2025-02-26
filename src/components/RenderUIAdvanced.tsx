import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { Pause, Play, Plus, Users } from 'lucide-react';

interface RenderBlock {
  id: string;
  sceneName: string;
  startFrame: number;
  endFrame: number;
  assignedTo: string | null;
  color: string;
}

interface RenderClient {
  id: string;
  name: string;
  status: 'idle' | 'rendering' | 'paused';
  blocks: RenderBlock[];
}

const colors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
];

function SortableBlock({ block, totalFrames, isDragging = false }: {
  block: RenderBlock;
  totalFrames: number;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: block.id });

  const width = Math.max(((block.endFrame - block.startFrame + 1) / totalFrames) * 100, 10);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
    width: `${width}%`,
  } : {
    width: `${width}%`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        ${block.color} 
        p-2 
        rounded 
        cursor-move 
        min-w-[100px] 
        mb-2 
        touch-manipulation 
        transition-colors
        duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="font-medium truncate">{block.sceneName}</div>
      <div className="text-sm truncate">
        {block.startFrame} - {block.endFrame}
      </div>
    </div>
  );
}

function DroppableZone({ client, children }: { client: RenderClient, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: client.id,
    data: {
      type: 'client',
      client,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-4
        rounded-lg 
        transition-colors 
        duration-200
        min-h-[120px]
        ${isOver ? 'bg-blue-500/20' : 'bg-gray-100/5'}
      `}
    >
      {children}
    </div>
  );
}

const RenderUIAdvanced = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [clients, setClients] = useState<RenderClient[]>([
    { id: '1', name: 'Render Node 1', status: 'idle', blocks: [] },
    { id: '2', name: 'Render Node 2', status: 'idle', blocks: [] },
    { id: '3', name: 'Render Node 3', status: 'idle', blocks: [] },
  ]);

  const [blocks, setBlocks] = useState<RenderBlock[]>([
    {
      id: '1',
      sceneName: 'Opening Scene',
      startFrame: 1,
      endFrame: 100,
      assignedTo: null,
      color: colors[0],
    },
    {
      id: '2',
      sceneName: 'Main Action',
      startFrame: 101,
      endFrame: 300,
      assignedTo: null,
      color: colors[1],
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeContainerId, setActiveContainerId] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState({
    sceneName: '',
    startFrame: 0,
    endFrame: 0,
  });

  const [newClientName, setNewClientName] = useState('');

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);
  const totalFrames = Math.max(...blocks.map(b => b.endFrame), 1);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const activeBlock = blocks.find(b => b.id === active.id);
    setActiveContainerId(activeBlock?.assignedTo || 'unassigned');
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveContainerId(null);

    if (!over) return;

    const activeBlock = blocks.find(b => b.id === active.id);
    if (!activeBlock) return;

    const overId = over.id;

    // If dropping onto a client
    if (clients.some(c => c.id === overId)) {
      setBlocks(prevBlocks => prevBlocks.map(block => {
        if (block.id === active.id) {
          return { ...block, assignedTo: overId as string };
        }
        return block;
      }));
      return;
    }

    // If dropping onto unassigned area
    if (overId === 'unassigned') {
      setBlocks(prevBlocks => prevBlocks.map(block => {
        if (block.id === active.id) {
          return { ...block, assignedTo: null };
        }
        return block;
      }));
      return;
    }

    // If reordering within the same container
    const overBlock = blocks.find(b => b.id === overId);
    if (overBlock && activeBlock.assignedTo === overBlock.assignedTo) {
      setBlocks(prevBlocks => {
        const oldIndex = prevBlocks.findIndex(b => b.id === active.id);
        const newIndex = prevBlocks.findIndex(b => b.id === overId);
        return arrayMove(prevBlocks, oldIndex, newIndex);
      });
    }
  }, [blocks, clients]);

  const activeBlock = activeId ? blocks.find(block => block.id === activeId) : null;

  const toggleRendering = (clientId: string) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          status: client.status === 'rendering' ? 'paused' : 'rendering'
        };
      }
      return client;
    }));
  };

  const addNewBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlock.sceneName && newBlock.endFrame > newBlock.startFrame) {
      setBlocks(prevBlocks => [
        ...prevBlocks,
        {
          id: Date.now().toString(),
          ...newBlock,
          assignedTo: null,
          color: colors[prevBlocks.length % colors.length],
        },
      ]);
      if (formRef.current) {
        formRef.current.reset();
      }
      setNewBlock({
        sceneName: '',
        startFrame: 0,
        endFrame: 0,
      });
    }
  };

  const addNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim()) {
      setClients(prevClients => [
        ...prevClients,
        {
          id: Date.now().toString(),
          name: newClientName,
          status: 'idle',
          blocks: [],
        },
      ]);
      setNewClientName('');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Advanced Render Manager</h2>
            <form ref={formRef} onSubmit={addNewBlock} className="flex gap-2">
              <input
                type="text"
                placeholder="Scene Name"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2"
                value={newBlock.sceneName}
                onChange={(e) => setNewBlock(prev => ({ ...prev, sceneName: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Start Frame"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2 w-24"
                value={newBlock.startFrame || ''}
                onChange={(e) => setNewBlock(prev => ({ ...prev, startFrame: parseInt(e.target.value) }))}
              />
              <input
                type="number"
                placeholder="End Frame"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2 w-24"
                value={newBlock.endFrame || ''}
                onChange={(e) => setNewBlock(prev => ({ ...prev, endFrame: parseInt(e.target.value) }))}
              />
              <button
                type="submit"
                className="bg-blue-500 p-2 rounded hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1 bg-white dark:bg-[#2a2a2a] p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Unassigned Blocks</h3>
              <div
                ref={useDroppable({ id: 'unassigned' }).setNodeRef}
                className={`min-h-[200px] p-2 rounded ${
                  useDroppable({ id: 'unassigned' }).isOver ? 'bg-blue-500/20' : ''
                }`}
              >
                <SortableContext
                  items={blocks.filter(block => !block.assignedTo).map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks
                    .filter(block => !block.assignedTo)
                    .map(block => (
                      <SortableBlock key={block.id} block={block} totalFrames={totalFrames} />
                    ))
                  }
                </SortableContext>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <form onSubmit={addNewClient} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="New Client Name"
                  className="flex-1 bg-gray-100 dark:bg-[#333] border rounded p-2"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-green-500 p-2 rounded hover:bg-green-600"
                >
                  <Users className="h-5 w-5" />
                </button>
              </form>

              {clients.map(client => (
                <div
                  key={client.id}
                  className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{client.name}</h3>
                    <button
                      onClick={() => toggleRendering(client.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-[#333] rounded-full transition-colors"
                    >
                      {client.status === 'rendering' ? (
                        <Pause className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Play className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </div>
                  <DroppableZone client={client}>
                    <SortableContext
                      items={blocks.filter(block => block.assignedTo === client.id).map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex gap-2 flex-wrap">
                        {blocks
                          .filter(block => block.assignedTo === client.id)
                          .map(block => (
                            <SortableBlock key={block.id} block={block} totalFrames={totalFrames} />
                          ))
                        }
                      </div>
                    </SortableContext>
                  </DroppableZone>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeBlock && (
          <SortableBlock
            block={activeBlock}
            totalFrames={totalFrames}
            isDragging={true}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default RenderUIAdvanced;