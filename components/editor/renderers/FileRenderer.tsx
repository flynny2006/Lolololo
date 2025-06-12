import React from 'react';
import type { FileComponentProps, StyleObjectType } from '../../../types';

interface RendererProps extends FileComponentProps {
  style: StyleObjectType;
  isPublishedView?: boolean;
}

const FileRenderer: React.FC<RendererProps> = ({ fileName, fileUrl, style, isPublishedView }) => {
  const defaultStyles: React.CSSProperties = {
    textDecoration: 'underline',
    cursor: 'pointer',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isPublishedView) {
      e.preventDefault(); // Prevent navigation in editor view
      console.log(`File link clicked: ${fileName} -> ${fileUrl}. Would open in published view.`);
    }
  };

  return (
    <a
      href={fileUrl || '#'}
      target={isPublishedView ? "_blank" : undefined}
      rel={isPublishedView ? "noopener noreferrer" : undefined}
      style={{ ...defaultStyles, ...style }}
      onClick={handleClick}
      title={`Open file: ${fileName}`}
    >
      {fileName || "File Link"}
    </a>
  );
};

export default FileRenderer;