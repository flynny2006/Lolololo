import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Project, EditorComponentModel } from '../types';

import TextRenderer from './editor/renderers/TextRenderer';
import ButtonRenderer from './editor/renderers/ButtonRenderer';
import ImageRenderer from './editor/renderers/ImageRenderer';
import IconRenderer from './editor/renderers/IconRenderer';
import FileRenderer from './editor/renderers/FileRenderer';
import DownloadButtonRenderer from './editor/renderers/DownloadButtonRenderer';
import DiscordBoxRenderer from './editor/renderers/DiscordBoxRenderer';


interface SiteViewerViewProps {
  projectId: string;
  onExit: () => void;
}

const SiteViewerView: React.FC<SiteViewerViewProps> = ({ projectId, onExit }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishedProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('id, website_name, published_content, user_id') 
          .eq('id', projectId)
          .single();

        if (fetchError) throw fetchError;
        
        if (data && (!data.published_content || (data.published_content as EditorComponentModel[]).length === 0)) {
            setError("This site has not been published yet or has no content.");
            setProject(null);
        } else if (data) {
           setProject(data as Project);
        } else {
           setError("Site not found or you do not have permission to view it.");
           setProject(null);
        }

      } catch (err: any) {
        console.error('Error fetching published site:', err);
        setError(err.message || 'Failed to load site data.');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedProject();
  }, [projectId]);

  const renderComponent = (component: EditorComponentModel) => {
    const componentProps = {
        ...component.props,
        style: component.style,
    };
    
    switch (component.type) {
      case 'text':
        return <TextRenderer {...componentProps as any} />;
      case 'button':
        // For published view, make button functional if actionUrl exists
        const buttonSpecificProps = component.props as import('../types').ButtonComponentProps;
        return <ButtonRenderer {...componentProps as any} actionUrl={buttonSpecificProps.actionUrl} />;
      case 'image':
        return <ImageRenderer {...componentProps as any} />;
      case 'icon':
        return <IconRenderer {...componentProps as any} />;
      case 'file':
        return <FileRenderer {...componentProps as any} isPublishedView={true} />;
      case 'downloadButton':
        return <DownloadButtonRenderer {...componentProps as any} isPublishedView={true} />;
      case 'discordBox':
        return <DiscordBoxRenderer {...componentProps as any} />;
      default:
        return <div className="p-1 text-xs text-red-400">(Unknown component: {component.type})</div>;
    }
  };
  
  const pageBackgroundColor = '#000000'; // Default, could be made dynamic if a "Page Settings" component existed

  return (
    <div style={{ backgroundColor: pageBackgroundColor }} className="min-h-screen bg-black text-white selection:bg-neutral-500 selection:text-neutral-900">
      <header className="bg-neutral-900 bg-opacity-80 backdrop-blur-sm p-3 flex justify-between items-center sticky top-0 z-50 border-b border-neutral-800">
        <h1 className="text-lg font-semibold text-neutral-100">
          Viewing: {project?.website_name || 'Published Site'}
        </h1>
        <button
          onClick={onExit}
          className="text-sky-400 hover:text-sky-300 font-medium py-1.5 px-3 rounded-md hover:bg-neutral-700 transition-colors"
        >
          &larr; Back to Projects
        </button>
      </header>

      <main className="p-0">
        {loading && (
          <div className="flex items-center justify-center h-[calc(100vh-100px)] text-neutral-400">
            <svg className="animate-spin h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading published site...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-[calc(100vh-100px)] text-red-400 p-5 text-center">
            Error: {error}
          </div>
        )}
        {!loading && !error && project && project.published_content && (
          <div className="site-content-wrapper max-w-full mx-auto"> 
            {(project.published_content as EditorComponentModel[]).map(component => (
              <div key={component.id} className="component-render-wrapper">
                {renderComponent(component)}
              </div>
            ))}
          </div>
        )}
         {!loading && !error && project && (!project.published_content || (project.published_content as EditorComponentModel[]).length === 0) && (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-neutral-500 p-5 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="text-xl">This site is empty.</p>
                <p className="text-sm">The owner hasn't added any content or published it yet.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default SiteViewerView;