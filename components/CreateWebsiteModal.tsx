import React, { useState, useEffect, useCallback } from 'react';
import type { CreateWebsiteModalProps, WebsiteCreationDetails } from '../types';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  isTextArea?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, placeholder, type = "text", required = false, isTextArea = false, disabled = false }) => {
  const commonProps = {
    id,
    name: id,
    value,
    onChange,
    placeholder,
    required,
    disabled,
    className: `block w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 placeholder-neutral-500 caret-sky-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};


export const CreateWebsiteModal: React.FC<CreateWebsiteModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [websiteName, setWebsiteName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setWebsiteName('');
    setDeveloperName('');
    setDescription('');
    setFormError(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!websiteName.trim() || !developerName.trim() || !description.trim()) {
        setFormError("Please fill in all required fields.");
        return;
    }
    await onSubmit({ websiteName, developerName, description });
    // Parent (App.tsx) will handle closing the modal on successful submission.
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
      aria-labelledby="create-website-modal-title"
    >
      <div
        className="bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg border border-neutral-800 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="create-website-modal-title" className="text-xl sm:text-2xl font-semibold text-white">Create New Website</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-700 disabled:opacity-50"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            id="websiteName"
            label="Website Name"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            placeholder="e.g., My Awesome Portfolio"
            required
            disabled={isSubmitting}
          />
          <InputField
            id="developerName"
            label="Developer Name"
            value={developerName}
            onChange={(e) => setDeveloperName(e.target.value)}
            placeholder="e.g., Alex Doe"
            required
            disabled={isSubmitting}
          />
          <InputField
            id="description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of your website's purpose"
            isTextArea
            required
            disabled={isSubmitting}
          />
          
          {formError && <p className="text-sm text-red-500 mb-4">{formError}</p>}

          <div className="mt-8 flex justify-end space-x-3 sm:space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-lg text-neutral-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-lg text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};