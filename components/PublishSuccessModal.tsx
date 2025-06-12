import React, { useState } from 'react';
import type { PublishSuccessModalProps } from '../types';

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({ isOpen, onClose, publishedUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy link: ', err);
      alert('Failed to copy link. Please copy it manually.');
    }
  };

  const handleViewSite = () => {
    window.open(publishedUrl, '_blank');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-success-modal-title"
    >
      <div
        className="bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-neutral-800 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="publish-success-modal-title" className="text-xl sm:text-2xl font-semibold text-green-400">Site Published Successfully!</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-neutral-300 mb-2">Your website is now live at:</p>
        <div className="mb-6 bg-neutral-800 border border-neutral-700 rounded-md p-3 text-sky-400 break-all text-sm">
          <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{publishedUrl}</a>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-150 font-medium"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleViewSite}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-150 font-medium"
          >
            View Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishSuccessModal;