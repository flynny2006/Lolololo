import React from 'react';
import type { ButtonComponentProps, StyleObjectType } from '../../../types';

interface RendererProps extends ButtonComponentProps {
  style: StyleObjectType;
}

const ButtonRenderer: React.FC<RendererProps> = ({ label, actionUrl, style }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default if it's in a form or something
    if (actionUrl) {
      // In a real published site, this would navigate. In editor, it might do nothing or show a mock.
      // For simplicity, we make it non-functional in the editor preview by default
      // but if we were to make it functional in preview: window.open(actionUrl, '_blank');
      console.log(`Button clicked, would navigate to: ${actionUrl}`);
    }
  };

  const defaultStyles: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    cursor: 'pointer',
    borderRadius: style.borderRadius || '4px', // Use from style prop or default
    // Ensure all style properties from the style object are applied
  };

  return (
    <button style={{ ...defaultStyles, ...style }} onClick={handleClick} className="min-w-[80px]">
      {label || "Button"}
    </button>
  );
};

export default ButtonRenderer;