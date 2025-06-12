import React from 'react';
import type { IconComponentProps, StyleObjectType } from '../../../types';

interface RendererProps extends IconComponentProps {
  style: StyleObjectType;
}

const PREDEFINED_ICONS: Record<string, string> = {
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  xmark: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
};


const IconRenderer: React.FC<RendererProps> = ({ iconIdentifier, style }) => {
  const iconSize = style.fontSize || '24px'; // Use fontSize for icon size convention
  const iconColor = style.color || 'currentColor';

  let iconPathData = PREDEFINED_ICONS[iconIdentifier?.toLowerCase()] || iconIdentifier;

  // Basic check if it's likely an SVG path
  const isSvgPath = iconIdentifier && iconIdentifier.toUpperCase().startsWith('M');
  if (isSvgPath) {
    iconPathData = iconIdentifier;
  } else if (!PREDEFINED_ICONS[iconIdentifier?.toLowerCase()]) {
    // If not a predefined icon and not an SVG path, render identifier as text or a placeholder.
    // This could be enhanced to support icon font classes.
    return <span style={{fontSize: iconSize, color: iconColor, ...style}} title={iconIdentifier || "Icon"}>❓</span>;
  }


  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24" // Common viewBox, adjust if necessary for specific icons
      width={iconSize}
      height={iconSize}
      fill={iconColor}
      style={{ display: 'inline-block', verticalAlign: style.verticalAlign || 'middle', ...style }}
      aria-label={iconIdentifier || 'icon'}
    >
      <path d={iconPathData}></path>
    </svg>
  );
};

export default IconRenderer;