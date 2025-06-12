import React, {useRef, useEffect} from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import type { EditorComponentModel } from '../../types';
import TextRenderer from './renderers/TextRenderer';
import ButtonRenderer from './renderers/ButtonRenderer';
import ImageRenderer from './renderers/ImageRenderer';
import IconRenderer from './renderers/IconRenderer';
import FileRenderer from './renderers/FileRenderer';
import DownloadButtonRenderer from './renderers/DownloadButtonRenderer';
import DiscordBoxRenderer from './renderers/DiscordBoxRenderer';


interface CanvasProps {
  components: EditorComponentModel[];
  onSelectComponent: (componentId: string) => void;
  onDeleteComponent: (componentId: string) => void;
  selectedComponentId: string | null;
}

const Canvas: React.FC<CanvasProps> = ({ components, onSelectComponent, onDeleteComponent, selectedComponentId }) => {
  const clickCounts = useRef<Record<string, number>>({});
  const clickTimeout = useRef<Record<string, NodeJS.Timeout | null>>({});

  const handleComponentClick = (componentId: string) => {
    onSelectComponent(componentId);

    clickCounts.current[componentId] = (clickCounts.current[componentId] || 0) + 1;

    if (clickTimeout.current[componentId]) {
      clearTimeout(clickTimeout.current[componentId]!);
    }

    if (clickCounts.current[componentId] === 3) {
      onDeleteComponent(componentId);
      clickCounts.current[componentId] = 0; 
    } else {
      clickTimeout.current[componentId] = setTimeout(() => {
        clickCounts.current[componentId] = 0; 
      }, 500);
    }
  };
  
  useEffect(() => {
    return () => {
      Object.values(clickTimeout.current).forEach(timeoutId => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, []);


  const renderComponent = (component: EditorComponentModel) => {
    const componentProps = {
      ...component.props, 
      style: component.style, 
      'data-component-id': component.id, 
    };

    switch (component.type) {
      case 'text':
        return <TextRenderer {...componentProps as any} />;
      case 'button':
        return <ButtonRenderer {...componentProps as any} />;
      case 'image':
        return <ImageRenderer {...componentProps as any} />;
      case 'icon':
        return <IconRenderer {...componentProps as any} />;
      case 'file':
        return <FileRenderer {...componentProps as any} />;
      case 'downloadButton':
        return <DownloadButtonRenderer {...componentProps as any} />;
      case 'discordBox':
        return <DiscordBoxRenderer {...componentProps as any} />;
      default:
        return <div className="p-2 border border-red-500 bg-red-100 text-red-700">Unknown component type: {component.type}</div>;
    }
  };

  return (
    <Droppable droppableId="canvas">
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`min-h-full p-4 rounded-lg transition-colors
                      ${snapshot.isDraggingOver ? 'bg-neutral-700' : 'bg-neutral-800'}`}
          style={{ boxShadow: snapshot.isDraggingOver ? 'inset 0 0 10px rgba(0,0,0,0.3)' : 'none' }}
        >
          {components.length === 0 && !snapshot.isDraggingOver && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-600 rounded-lg text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-xl">Drag components here</p>
              <p className="text-sm">Build your page by dropping elements from the left sidebar.</p>
            </div>
          )}
          {components.map((component, index) => (
            <Draggable key={component.id} draggableId={component.id} index={index}>
              {(providedDraggable, snapshotDraggable) => (
                <div
                  ref={providedDraggable.innerRef}
                  {...providedDraggable.draggableProps}
                  {...providedDraggable.dragHandleProps}
                  onClick={(e) => { e.stopPropagation(); handleComponentClick(component.id); }}
                  className={`mb-2 p-1 rounded transition-all duration-150 ease-in-out transform
                              ${selectedComponentId === component.id ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-neutral-800 shadow-lg' : 'hover:ring-1 hover:ring-sky-600'}
                              ${snapshotDraggable.isDragging ? 'opacity-75 shadow-2xl scale-105' : ''}`}
                  style={{...providedDraggable.draggableProps.style, outline: 'none'}}
                >
                  {renderComponent(component)}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Canvas;