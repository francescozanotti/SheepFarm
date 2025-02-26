import { useState } from 'react';
import { DragDropContext, DropResult, Draggable, Droppable } from '@hello-pangea/dnd';
import { Pause, Play, Plus, Users, Trash2 } from 'lucide-react';

interface Block {
  id: string;
  sceneName: string;
  startFrame: number;
  endFrame: number;
  color: string;
}

interface RenderNode {
  id: string;
  name: string;
  engine: string;
  status: 'idle' | 'rendering' | 'paused';
  blocks: Block[];
}

const colors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
];

const getRandomColor = (sceneName: string) => {
  const hash = sceneName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const RenderUIAdvanced = () => {
  const [newBlocks, setNewBlocks] = useState<Block[]>([]);
  const [renderNodes, setRenderNodes] = useState<RenderNode[]>([
    { id: 'node-1', name: 'Render Node 1', engine: 'Engine A', status: 'idle', blocks: [] },
    { id: 'node-2', name: 'Render Node 2', engine: 'Engine B', status: 'idle', blocks: [] },
    { id: 'node-3', name: 'Render Node 3', engine: 'Engine C', status: 'idle', blocks: [] },
  ]);

  const [isDraggingToTrash, setIsDraggingToTrash] = useState(false);
  const [trashScale, setTrashScale] = useState(1);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEngine, setNewClientEngine] = useState('');

  const handleCreateBlock = (block: Omit<Block, 'id' | 'color'>) => {
    const newBlock = {
      ...block,
      id: `block-${Date.now()}`,
      color: getRandomColor(block.sceneName),
    };
    setNewBlocks(prev => [...prev, newBlock]);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Trash logic
    if (destination?.droppableId === 'trash') {
      if (source.droppableId === 'new-blocks') {
        setNewBlocks(prev => prev.filter(block => block.id !== result.draggableId));
      } else {
        setRenderNodes(prev =>
          prev.map(node => ({
            ...node,
            blocks: node.blocks.filter(block => block.id !== result.draggableId),
          }))
        );
      }
      setIsDraggingToTrash(false);
      setTrashScale(1);
      return;
    }

    if (!destination) return;

    // Create copies of current state to work with
    let newBlocksCopy = [...newBlocks];
    let renderNodesCopy = renderNodes.map(node => ({
      ...node,
      blocks: [...node.blocks],
    }));

    // Get the item being dragged
    let movedItem: Block;

    // Remove from source
    if (source.droppableId === 'new-blocks') {
      [movedItem] = newBlocksCopy.splice(source.index, 1);
    } else {
      const sourceNode = renderNodesCopy.find(n => n.id === source.droppableId);
      if (sourceNode) {
        [movedItem] = sourceNode.blocks.splice(source.index, 1);
      }
    }

    // Add to destination
    if (destination.droppableId === 'new-blocks') {
      newBlocksCopy.splice(destination.index, 0, movedItem!);
    } else {
      const destNode = renderNodesCopy.find(n => n.id === destination.droppableId);
      if (destNode) {
        destNode.blocks.splice(destination.index, 0, movedItem!);
      }
    }

    // Update state
    setNewBlocks(newBlocksCopy);
    setRenderNodes(renderNodesCopy);
    setIsDraggingToTrash(false);
    setTrashScale(1);
  };

  const handleDragUpdate = (update: any) => {
    const trashIcon = document.getElementById('trash-icon');
    if (!trashIcon || !update.client) return;

    const trashRect = trashIcon.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(update.client.x - trashRect.x, 2) + Math.pow(update.client.y - trashRect.y, 2)
    );

    const maxDistance = 150;
    const scale = Math.max(1, 2 - distance / maxDistance);
    setTrashScale(scale);

    if (distance < 50) {
      setIsDraggingToTrash(true);
    } else {
      setIsDraggingToTrash(false);
    }
  };

  const toggleRendering = (clientId: string) => {
    setRenderNodes(renderNodes.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          status: client.status === 'rendering' ? 'paused' : 'rendering',
        };
      }
      return client;
    }));
  };

  const addNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClientName.trim() && newClientEngine.trim()) {
      setRenderNodes(prev => [
        ...prev,
        {
          id: `node-${Date.now()}`,
          name: newClientName,
          engine: newClientEngine,
          status: 'idle',
          blocks: [],
        },
      ]);
      setShowNewClientForm(false);
      setNewClientName('');
      setNewClientEngine('');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <div className="p-6 relative">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Advanced Render Manager</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const sceneName = formData.get('sceneName') as string;
                const startFrame = parseInt(formData.get('startFrame') as string);
                const endFrame = parseInt(formData.get('endFrame') as string);

                if (sceneName && startFrame >= 0 && endFrame > startFrame) {
                  handleCreateBlock({ sceneName, startFrame, endFrame });
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="sceneName"
                placeholder="Scene Name"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2"
                required
              />
              <input
                type="number"
                name="startFrame"
                placeholder="Start Frame"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2 w-24"
                min="0"
                required
              />
              <input
                type="number"
                name="endFrame"
                placeholder="End Frame"
                className="bg-gray-100 dark:bg-[#333] border rounded p-2 w-24"
                min="0"
                required
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
              <DroppableSection
                id="new-blocks"
                title="New Blocks"
                blocks={newBlocks}
              />
            </div>

            <div className="col-span-4 space-y-4">
              {renderNodes.map((client, index) => (
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
                  <DroppableSection
                    id={client.id}
                    title={client.name}
                    blocks={client.blocks}
                    isCompact={client.blocks.length === 0}
                  />
                </div>
              ))}

              {/* Add New Client Button */}
              <button
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="flex items-center justify-center w-full p-2 bg-gray-100 dark:bg-[#333] rounded-lg hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>

              {/* New Client Form */}
              {showNewClientForm && (
                <form
                  onSubmit={addNewClient}
                  className="bg-white dark:bg-[#2a2a2a] p-4 rounded-lg shadow"
                >
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      placeholder="Render Node Name"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="bg-gray-100 dark:bg-[#333] border rounded p-2 flex-1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Render Node Engine"
                      value={newClientEngine}
                      onChange={(e) => setNewClientEngine(e.target.value)}
                      className="bg-gray-100 dark:bg-[#333] border rounded p-2 flex-1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-green-500 p-2 rounded hover:bg-green-600"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Trash Icon */}
        <div
          id="trash-icon"
          className="fixed bottom-6 right-6 p-3 rounded-full bg-red-500/20 transition-all duration-200"
          style={{
            transform: `scale(${trashScale})`,
          }}
        >
          <Trash2
            className={`h-6 w-6 ${isDraggingToTrash ? 'text-red-500' : 'text-gray-500'}`}
          />
        </div>

        {/* Trash Drop Zone */}
        <Droppable droppableId="trash">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="fixed bottom-0 right-0 w-32 h-32"
            />
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default RenderUIAdvanced;

const DroppableSection = ({ id, title, blocks, isCompact }: { id: string; title: string; blocks: Block[]; isCompact?: boolean }) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            transition-all duration-200
            ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
            rounded-lg
            ${isCompact ? 'min-h-[40px]' : 'min-h-[200px]'}
          `}
        >
          <div className="flex flex-wrap gap-2">
            {blocks.map((block, index) => (
              <Block key={block.id} block={block} index={index} />
            ))}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

const Block = ({ block, index }: { block: Block; index: number }) => {
  const duration = block.endFrame - block.startFrame;
  const width = Math.min(Math.max(duration / 10, 100), 300); // Scale width based on duration

  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            p-3 rounded-lg mb-2
            ${snapshot.isDragging ? 'bg-blue-100 shadow-lg' : block.color}
            border border-gray-200
            transition-all duration-200
            hover:shadow-md
            cursor-grab active:cursor-grabbing
          `}
          style={{
            width: `${width}px`,
            ...provided.draggableProps.style,
          }}
        >
          <div className="text-sm font-medium text-gray-700">
            {block.sceneName}
          </div>
          <div className="text-xs text-gray-500">
            {block.startFrame} - {block.endFrame}
          </div>
        </div>
      )}
    </Draggable>
  );
};