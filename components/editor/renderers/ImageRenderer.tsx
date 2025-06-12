import React from 'react';
import type { ImageComponentProps, StyleObjectType } from '../../../types';

interface RendererProps extends ImageComponentProps {
  style: StyleObjectType;
}

const ImageRenderer: React.FC<RendererProps> = ({ src, alt, style }) => {
  const defaultStyles: React.CSSProperties = {
    maxWidth: '100%', // Ensure image is responsive within its container by default
    display: 'block', // Removes extra space below inline images
    objectFit: 'cover', // Common default, can be overridden by style prop
  };
  return (
    <img
      src={src || "https://via.placeholder.com/150?text=No+Image"}
      alt={alt || "User image"}
      style={{ ...defaultStyles, ...style }}
      draggable={false} // Prevent native image drag which conflicts with dnd
    />
  );
};

export default ImageRenderer;