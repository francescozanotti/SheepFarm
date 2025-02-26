import { useState } from 'react';
import { Droppable, Draggable, DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Pause, Play, Plus, Users } from 'lucide-react';

interface Block {
  id: string;
  startFrame: number;
  endFrame: number;
}

interface RenderNode {
  id: string;
  name: string;
  status: 'idle' | 'rendering' | 'paused';
  blocks: Block[];
}

const RenderUIAdvanced = () => {
  const [newBlocks, setNewBlocks] = useState<Block[]>([]);
  const [renderNodes, setRenderNodes] = useState<RenderNode[]>([
    { id: 'node-1', name: 'Render Node 1', status: 'idle', blocks: [] },
    { id: 'node-2', name: 'Render Node 2', status: 'idle', blocks: [] },
    { id: 'node-3', name: 'Render Node 3', status: 'idle', blocks: [] },
  ]);

  const handleCreateBlock = (block: Block) => {
    setNewBlocks(prev => [...prev, block]);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // Create copies of current state to work with
    let newBlocksCopy = [...newBlocks];
    let renderNodesCopy = renderNodes.map(node => ({
      ...node,
      blocks: [...node.blocks]
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
  };

  const toggleRendering = (clientId: string) => {
    setRenderNodes(renderNodes.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          status: client.status === 'rendering' ? 'paused' : 'rendering'
        }
      }
      return client
    }))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Advanced Render Manager</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const startFrame = parseInt((e.currentTarget.elements.namedItem('startFrame') as HTMLInputElement).value);
              const endFrame = parseInt((e.currentTarget.elements.namedItem('endFrame') as HTMLInputElement).value);
              if (startFrame >= 0 && endFrame > startFrame) {
                handleCreateBlock({
                  id: `block-${Date.now()}`,
                  startFrame,
                  endFrame
                });
                e.currentTarget.reset();
              }
            }} className="flex gap-2">
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
              <form onSubmit={(e) => {
                e.preventDefault();
                const newClientName = (e.currentTarget.elements.namedItem('newClientName') as HTMLInputElement).value;
                if (newClientName.trim()) {
                  setRenderNodes(prevClients => [
                    ...prevClients,
                    {
                      id: `node-${Date.now()}`,
                      name: newClientName,
                      status: 'idle',
                      blocks: [],
                    },
                  ]);
                  e.currentTarget.reset();
                }
              }} className="flex gap-2 items-center">
                <input
                  type="text"
                  name="newClientName"
                  placeholder="New Client Name"
                  className="flex-1 bg-gray-100 dark:bg-[#333] border rounded p-2"
                />
                <button
                  type="submit"
                  className="bg-green-500 p-2 rounded hover:bg-green-600"
                >
                  <Users className="h-5 w-5" />
                </button>
              </form>
              
              {renderNodes.map(client => (
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
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default RenderUIAdvanced;

const DroppableSection = ({ id, title, blocks }: { id: string; title: string; blocks: Block[] }) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            min-h-[200px] min-w-[320px]
            transition-colors duration-200
            ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
            rounded-lg
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
            ${snapshot.isDragging ? 'bg-blue-100 shadow-lg' : 'bg-white'}
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
            {block.startFrame} - {block.endFrame}
          </div>
          <div className="text-xs text-gray-500">
            Frames: {duration}
          </div>
        </div>
      )}
    </Draggable>
  );
};