import React from 'react';
// Props are simplified as the list rendering is now in App.tsx
// It still needs onOpenCreateModal. Projects and loadingProjects are handled by App.tsx directly.
interface ProjectListButtonProps {
  onOpenCreateModal: () => void;
}

export const ProjectList: React.FC<ProjectListButtonProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="flex justify-center items-center mb-8">
      <button
        onClick={onOpenCreateModal}
        className="bg-white text-black font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-75 transition-colors duration-150 transform hover:scale-105"
        aria-label="Create new website project"
      >
        <span className="mr-2 text-xl" aria-hidden="true">+</span> Create Website
      </button>
    </div>
  );
};