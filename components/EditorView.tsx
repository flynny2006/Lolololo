import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import ComponentSidebar from './editor/ComponentSidebar';
import Canvas from './editor/Canvas';
import PropertiesPanel from './editor/PropertiesPanel';
import PublishSuccessModal from './PublishSuccessModal'; // Import the new modal
import { supabase } from '../supabaseClient';
import type { Project, EditorComponentModel, ComponentType, StyleObjectType, SpecificComponentProps, IconComponentProps, FileComponentProps, DownloadFileButtonProps, DiscordServerBoxProps } from '../types';

interface EditorViewProps {
  project: Project;
  onExit: () => void;
  onPublishSuccess: (publishedUrl: string) => void; // Callback to refresh project list & potentially show URL
}

// Debounce utility
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

const EditorView: React.FC<EditorViewProps> = ({ project, onExit, onPublishSuccess }) => {
  const [components, setComponents] = useState<EditorComponentModel[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishedSiteUrl, setPublishedSiteUrl] = useState('');


  useEffect(() => {
    setComponents(project.editor_content || []);
    setSelectedComponentId(project.editor_content && project.editor_content.length > 0 ? project.editor_content[0].id : null);
  }, [project]);

  const debouncedSaveEditorContent = useCallback(
    debounce(async (updatedComponents: EditorComponentModel[]) => {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('projects')
          .update({ editor_content: updatedComponents, id: project.id })
          .eq('id', project.id)
          .eq('user_id', project.user_id);

        if (error) throw error;
        setLastSaved(new Date());
        console.log('Editor content saved to Supabase');
      } catch (err: any) {
        console.error('Error saving editor content:', err);
        alert(`Error saving changes: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [project.id, project.user_id]
  );
  
  useEffect(() => {
    if (JSON.stringify(components) !== JSON.stringify(project.editor_content || [])) {
        debouncedSaveEditorContent(components);
    }
  }, [components, debouncedSaveEditorContent, project.editor_content]);


  const handleOnDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === 'component-sidebar' && destination.droppableId === 'canvas') {
      const componentType = draggableId.split('-')[0] as ComponentType;
      
      let newComponentProps: SpecificComponentProps;
      let newComponentStyle: StyleObjectType = { padding: '10px', fontSize: '16px', color: '#FFFFFF', textAlign: 'left' };

      switch (componentType) {
        case 'text':
          newComponentProps = { text: 'New Text Block' };
          break;
        case 'button':
          newComponentProps = { label: 'Click Me' };
          newComponentStyle = {...newComponentStyle, backgroundColor: '#007BFF', color: '#FFFFFF', borderRadius: '4px', textAlign: 'center', padding: '10px 15px' };
          break;
        case 'image':
          newComponentProps = { src: 'https://via.placeholder.com/150?text=Placeholder', alt: 'Placeholder Image' };
          newComponentStyle = {...newComponentStyle, width: '150px', height: 'auto'};
          break;
        case 'icon':
          newComponentProps = { iconIdentifier: 'star' } as IconComponentProps; // Default to a star or simple identifier
          newComponentStyle = {...newComponentStyle, fontSize: '24px', color: '#FFFFFF', width: 'auto', height: 'auto', verticalAlign: 'middle'};
          break;
        case 'file':
          newComponentProps = { fileName: 'MyDocument.pdf', fileUrl: '#' } as FileComponentProps;
          newComponentStyle = {...newComponentStyle, color: '#60a5fa'}; // Tailwind's sky-400
          break;
        case 'downloadButton':
          newComponentProps = { buttonLabel: 'Download File', fileUrl: '#', fileNameToDownload: 'download.zip' } as DownloadFileButtonProps;
          newComponentStyle = {...newComponentStyle, backgroundColor: '#10B981', color: '#FFFFFF', borderRadius: '4px', textAlign: 'center', padding: '10px 15px' }; // Tailwind's emerald-500
          break;
        case 'discordBox':
          newComponentProps = { serverId: 'YOUR_SERVER_ID', theme: 'dark' } as DiscordServerBoxProps;
          newComponentStyle = {...newComponentStyle, width: '300px', height: '400px', padding: '0px' };
          break;
        default:
          console.warn('Unknown component type:', componentType);
          return;
      }
      
      const newComponent: EditorComponentModel = {
        id: uuidv4(),
        type: componentType,
        props: newComponentProps,
        style: newComponentStyle,
      };

      const newComponents = Array.from(components);
      newComponents.splice(destination.index, 0, newComponent);
      setComponents(newComponents);
      setSelectedComponentId(newComponent.id);
    }
    else if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      if (source.index === destination.index) return;
      const items = Array.from(components);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setComponents(items);
    }
  };

  const handleSelectComponent = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  const handleUpdateComponent = (updatedComponent: EditorComponentModel) => {
    setComponents(prevComponents =>
      prevComponents.map(c => (c.id === updatedComponent.id ? updatedComponent : c))
    );
  };
  
  const handleDeleteComponent = (componentId: string) => {
    setComponents(prevComponents => prevComponents.filter(c => c.id !== componentId));
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Create a deep copy of the components to ensure data integrity
    const componentsToPublish = JSON.parse(JSON.stringify(components));
    
    console.log("Current editor components state (EditorView):", JSON.stringify(components, null, 2));
    console.log("Payload for Supabase (published_content - DEEP COPIED):", JSON.stringify(componentsToPublish, null, 2));
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          published_content: componentsToPublish, 
          last_published_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .eq('user_id', project.user_id);

      if (error) throw error;
      
      const url = `${window.location.origin}${window.location.pathname}#/view/${project.id}`;
      setPublishedSiteUrl(url);
      setIsPublishModalOpen(true);
      onPublishSuccess(url); // Call parent callback
    } catch (err: any) {
      console.error('Error publishing site:', err);
      alert(`Error publishing site: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };
  
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="flex flex-col h-screen bg-black text-white selection:bg-neutral-500 selection:text-neutral-900">
        <header className="bg-neutral-900 p-3 flex justify-between items-center border-b border-neutral-800 shadow-md">
          <div className="flex items-center">
             <button
              onClick={onExit}
              className="mr-3 text-sky-400 hover:text-sky-300 font-medium py-1.5 px-3 rounded-md hover:bg-neutral-700 transition-colors"
            >
              &larr; Back to Projects
            </button>
            <h1 className="text-xl font-semibold text-neutral-100">Editing: {project.website_name}</h1>
          </div>
          <div className="flex items-center">
            {isSaving && <span className="text-xs text-neutral-400 mr-3 animate-pulse">Saving...</span>}
            {!isSaving && lastSaved && <span className="text-xs text-green-400 mr-3">Saved: {lastSaved.toLocaleTimeString()}</span>}
            <button
              onClick={handlePublish}
              disabled={isPublishing || isSaving}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isPublishing ? (
                 <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : "Publish Site"}
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-neutral-900 p-4 border-r border-neutral-800 overflow-y-auto">
            <ComponentSidebar />
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-neutral-800">
            <Canvas
              components={components}
              onSelectComponent={handleSelectComponent}
              onDeleteComponent={handleDeleteComponent}
              selectedComponentId={selectedComponentId}
            />
          </div>

          <div className="w-80 bg-neutral-900 p-4 border-l border-neutral-800 overflow-y-auto">
            {selectedComponent ? (
              <PropertiesPanel
                key={selectedComponent.id}
                component={selectedComponent}
                onUpdateComponent={handleUpdateComponent}
              />
            ) : (
              <div className="text-center text-neutral-500 mt-10">
                <p className="text-lg">Select a component to edit its properties.</p>
                <p className="text-sm mt-2">Or, drag a new component from the left sidebar onto the canvas.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <PublishSuccessModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        publishedUrl={publishedSiteUrl}
      />
    </DragDropContext>
  );
};

export default EditorView;
