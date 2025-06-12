import React, { useState, useCallback, useEffect } from 'react';
import { ProjectList as ProjectListButton } from './components/ProjectList'; // Renamed import
import { CreateWebsiteModal } from './components/CreateWebsiteModal';
import { AuthComponent } from './components/Auth';
import EditorView from './components/EditorView';
import SiteViewerView from './components/SiteViewerView';
import { supabase } from './supabaseClient';
import type { WebsiteCreationDetails, Project, Session, User, View, EditorComponentModel } from './types';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const [isSubmittingProject, setIsSubmittingProject] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<View>('projectList');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Handle routing based on hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash.startsWith('/editor/')) {
        const id = hash.split('/editor/')[1];
        setCurrentProjectId(id);
        setCurrentView('editor');
      } else if (hash.startsWith('/view/')) {
        const id = hash.split('/view/')[1];
        setCurrentProjectId(id);
        setCurrentView('siteViewer');
      } else {
        setCurrentProjectId(null);
        setCurrentView('projectList');
        // if (window.location.hash && window.location.hash !== '#/') { 
        //      window.location.hash = '/'; 
        // }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#${path}`;
  };
  

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (!currentSession) {
        setLoadingProjects(false);
      }
    };
    getSession();

    const { data: authSubscriptionData } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession) {
          setProjects([]);
          setLoadingProjects(false);
          navigateTo('/'); 
        } else if (currentView !== 'editor' && currentView !== 'siteViewer') {
           fetchProjects(); 
        }
      }
    );

    return () => {
      authSubscriptionData?.subscription?.unsubscribe();
    };
  }, [currentView]); // currentView added to re-evaluate project fetching if view changes post-login

  const fetchProjects = useCallback(async () => {
    const effectiveUser = user || (await supabase.auth.getUser()).data.user;

    if (!effectiveUser) {
        setLoadingProjects(false);
        setProjects([]); 
        return;
    }
    
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', effectiveUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        alert(`Error fetching projects: ${error.message}`);
        setProjects([]);
      } else {
        setProjects(data as Project[] || []);
      }
    } catch (e) {
      console.error('Catch fetching projects:', e);
      alert('An unexpected error occurred while fetching projects.');
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]); 

  useEffect(() => {
    if (session && user && currentView === 'projectList') {
      fetchProjects();
    } else if (!session) {
        setProjects([]); 
        setLoadingProjects(false);
    }
  }, [session, user, currentView, fetchProjects]);


  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleCreateWebsite = async (details: WebsiteCreationDetails) => {
    if (!user) {
      alert("You must be logged in to create a project.");
      return;
    }
    setIsSubmittingProject(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          website_name: details.websiteName,
          developer_name: details.developerName,
          description: details.description,
          editor_content: [] as EditorComponentModel[], 
          published_content: [] as EditorComponentModel[],
        }])
        .select();

      if (error) throw error;
      if (data) {
        await fetchProjects(); 
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error("Error creating website:", err);
      alert(`Error creating project: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setIsSubmittingProject(false);
    }
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      alert("Project deleted successfully.");
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert(`Error deleting project: ${err.message || 'An unexpected error occurred.'}`);
    }
  };

  const handleLogout = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      setAuthError(error.message);
    }
  };
  
  const handleLoginSuccess = (newSession: Session) => {
    setAuthError(null);
    navigateTo('/'); 
  };
  
  const handlePublishSuccess = (publishedUrl: string) => {
    console.log("Site published! URL:", publishedUrl); // Can be used for notifications
    fetchProjects(); // Refresh project list to show "View Published Site" button status
  };


  if (!session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-neutral-500 selection:text-neutral-900">
        <AuthComponent onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }
  
  const selectedProjectForEditor = projects.find(p => p.id === currentProjectId);

  if (currentView === 'editor' && currentProjectId) {
    if (loadingProjects && !selectedProjectForEditor) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Loading Project Data for Editor...</div>;
    }
    if (!selectedProjectForEditor && !loadingProjects) {
         return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl p-4">Project not found or access denied. <a href="#/" className="ml-2 text-sky-400 hover:text-sky-300" onClick={(e) => {e.preventDefault(); navigateTo('/');}}>Go to Projects</a></div>;
    }
    return selectedProjectForEditor ? 
      <EditorView project={selectedProjectForEditor} onExit={() => navigateTo('/')} onPublishSuccess={handlePublishSuccess} /> 
      : <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Preparing Editor...</div>;
  }

  if (currentView === 'siteViewer' && currentProjectId) {
    return <SiteViewerView projectId={currentProjectId} onExit={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center pt-10 sm:pt-16 px-4 selection:bg-neutral-500 selection:text-neutral-900">
      <header className="w-full max-w-4xl mb-10 sm:mb-12 text-center relative">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
          Want to <span className="text-neutral-300">exactly</span> build what you want,
          <br /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-400 via-white to-neutral-400">best place!</span>
        </h1>
        <button
            onClick={handleLogout}
            className="absolute top-0 right-0 mt-1 mr-1 sm:mt-0 sm:mr-0 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-150"
            aria-label="Logout"
          >
            Logout
        </button>
         {authError && <p className="text-red-500 mt-2">{authError}</p>}
      </header>

      <main className="w-full max-w-4xl">
        <ProjectListButton onOpenCreateModal={handleOpenModal} />
        
        <div className="mt-10 p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-200 mb-6">Your Websites</h2>
          {loadingProjects ? (
            <div className="text-center text-neutral-500 py-10">
              <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-lg">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-neutral-500 py-10 border-2 border-dashed border-neutral-700 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="mt-4 text-lg">No websites created yet.</p>
              <p className="text-sm text-neutral-600">Click the button above to start your first project.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {projects.map(project => (
                <li key={project.id} className="bg-neutral-800 p-4 rounded-lg shadow border border-neutral-700 hover:border-neutral-600 transition-all duration-150">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-sky-400">{project.website_name}</h3>
                      <p className="text-sm text-neutral-300 mt-1">Developer: {project.developer_name}</p>
                      <p className="text-sm text-neutral-400 mt-1 max-w-prose">{project.description}</p>
                      <p className="text-xs text-neutral-500 mt-2">Created: {new Date(project.created_at).toLocaleDateString()}</p>
                       {project.last_published_at && (
                        <p className="text-xs text-green-400 mt-1">Last Published: {new Date(project.last_published_at).toLocaleString()}</p>
                      )}
                    </div>
                     <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-neutral-500 hover:text-red-500 p-1 rounded-full hover:bg-neutral-700 transition-colors"
                        aria-label="Delete project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-700 flex space-x-2">
                     <button
                        onClick={() => navigateTo(`/editor/${project.id}`)}
                        className="text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
                      >
                        Open Editor
                      </button>
                      {project.last_published_at && (
                        <button
                          onClick={() => navigateTo(`/view/${project.id}`)}
                          className="text-sm bg-green-600 hover:bg-green-500 text-white font-medium py-1.5 px-3 rounded-md transition-colors"
                        >
                          View Published Site
                        </button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateWebsite}
        isSubmitting={isSubmittingProject}
      />

      <footer className="py-8 mt-16 text-center text-neutral-600 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Website Builder. All rights reserved.</p>
         {user && <p className="text-xs">Logged in as: {user.email}</p>}
      </footer>
    </div>
  );
};

export default App;