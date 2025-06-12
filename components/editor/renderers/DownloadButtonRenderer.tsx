import React from 'react';
import type { DownloadFileButtonProps, StyleObjectType } from '../../../types';

interface RendererProps extends DownloadFileButtonProps {
  style: StyleObjectType;
  isPublishedView?: boolean;
}

const DownloadButtonRenderer: React.FC<RendererProps> = ({ buttonLabel, fileUrl, fileNameToDownload, style, isPublishedView }) => {
  const defaultStyles: React.CSSProperties = {
    display: 'inline-block',
    padding: '10px 15px',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: style.textAlign || 'center',
    borderRadius: style.borderRadius || '4px',
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isPublishedView && fileUrl !== '#') {
       e.preventDefault(); // Prevent actual download in editor if URL is set
       console.log(`Download button: ${buttonLabel}, URL: ${fileUrl}, Download As: ${fileNameToDownload}. Functional in published view.`);
    } else if (fileUrl === '#') {
        e.preventDefault(); // Prevent navigating to '#'
        console.log("Download button: No file URL provided.");
    }
    // In published view, the <a> tag handles the download naturally.
  };

  return (
    <a
      href={fileUrl || '#'}
      download={isPublishedView && fileUrl && fileUrl !== '#' ? fileNameToDownload : undefined}
      style={{ ...defaultStyles, ...style }}
      onClick={handleClick}
      role="button" // For accessibility if styled like a button
      aria-label={`Download ${fileNameToDownload || buttonLabel}`}
    >
      {buttonLabel || "Download"}
    </a>
  );
};

export default DownloadButtonRenderer;