import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import type { ComponentType } from '../../types';

interface SidebarItem {
  id: string; // Unique ID for the draggable item in the sidebar
  type: ComponentType;
  label: string;
  icon?: string; // Placeholder for potential icon
}

const availableComponents: SidebarItem[] = [
  { id: 'text-sidebar-item', type: 'text', label: 'Text Block' },
  { id: 'button-sidebar-item', type: 'button', label: 'Button' },
  { id: 'image-sidebar-item', type: 'image', label: 'Image' },
  { id: 'icon-sidebar-item', type: 'icon', label: 'Icon' },
  { id: 'file-sidebar-item', type: 'file', label: 'File Link' },
  { id: 'downloadButton-sidebar-item', type: 'downloadButton', label: 'Download Button' },
  { id: 'discordBox-sidebar-item', type: 'discordBox', label: 'Discord Server' },
];

const ComponentSidebar: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-300 mb-4">Components</h2>
      <Droppable droppableId="component-sidebar" isDropDisabled={true}>
        {(provided, snapshot) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {availableComponents.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(providedDraggable, snapshotDraggable) => (
                  <li
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    className={`p-3 border border-neutral-700 rounded-md cursor-grab transition-all duration-150
                                ${snapshotDraggable.isDragging ? 'bg-sky-600 shadow-xl scale-105' : 'bg-neutral-800 hover:bg-neutral-700 hover:border-sky-500'}`}
                    style={providedDraggable.draggableProps.style} // Important for dnd
                  >
                    <span className="text-sm text-neutral-100">{item.label}</span>
                    {/* Icon can be added here: e.g. <i className={`fas fa-${item.icon} mr-2`}></i> */}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
       <p className="text-xs text-neutral-500 mt-6 italic">
        Drag components onto the canvas in the middle.
      </p>
    </div>
  );
};

export default ComponentSidebar;