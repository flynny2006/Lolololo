import React from 'react';
import type { TextComponentProps, StyleObjectType } from '../../../types';

interface RendererProps extends TextComponentProps {
  style: StyleObjectType;
}

const TextRenderer: React.FC<RendererProps> = ({ text, style }) => {
  return (
    <div style={style} className="p-1 break-words"> {/* break-words to prevent overflow */}
      {text || "Empty Text"} {/* Display placeholder if text is empty */}
    </div>
  );
};

export default TextRenderer;