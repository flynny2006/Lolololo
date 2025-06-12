import React from 'react';
import type { DiscordServerBoxProps, StyleObjectType } from '../../../types';

interface RendererProps extends DiscordServerBoxProps {
  style: StyleObjectType;
}

const DiscordBoxRenderer: React.FC<RendererProps> = ({ serverId, theme = 'dark', style }) => {
  if (!serverId || serverId === 'YOUR_SERVER_ID') {
    return (
      <div style={{ ...style, border: '1px dashed #555', padding: '10px', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor: '#333' }} className="text-neutral-400">
        Discord Widget: Please provide a Server ID in properties.
      </div>
    );
  }

  const widgetUrl = `https://discord.com/widget?id=${serverId}&theme=${theme}`;

  const iframeStyles: React.CSSProperties = {
    width: style.width || '300px',
    height: style.height || '400px',
    border: 'none',
    ...style, // Allow style prop to override width/height/etc.
  };

  return (
    <iframe
      src={widgetUrl}
      style={iframeStyles}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      title={`Discord Server Widget - ${serverId}`}
    ></iframe>
  );
};

export default DiscordBoxRenderer;