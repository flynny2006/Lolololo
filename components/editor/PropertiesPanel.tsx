import React, { useState, useEffect, useCallback } from 'react';
import type { EditorComponentModel, StyleObjectType, TextComponentProps, ButtonComponentProps, ImageComponentProps, IconComponentProps, FileComponentProps, DownloadFileButtonProps, DiscordServerBoxProps } from '../../types';

interface PropertiesPanelProps {
  component: EditorComponentModel;
  onUpdateComponent: (updatedComponent: EditorComponentModel) => void;
}

const inputClass = "w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-neutral-500 caret-sky-500 text-sm";
const labelClass = "block text-xs font-medium text-neutral-400 mb-1";

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component, onUpdateComponent }) => {
  const [props, setProps] = useState(component.props);
  const [style, setStyle] = useState(component.style);

  useEffect(() => {
    setProps(component.props);
    setStyle(component.style);
  }, [component]);

  const handlePropChange = useCallback((propName: string, value: any) => {
    setProps(prevProps => ({ ...prevProps, [propName]: value }));
  }, []);

  const handleStyleChange = useCallback((styleName: keyof StyleObjectType, value: any) => {
    setStyle(prevStyle => ({ ...prevStyle, [styleName]: value }));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      onUpdateComponent({ ...component, props, style });
    }, 500); 
    return () => clearTimeout(handler);
  }, [props, style, component, onUpdateComponent]);

  const renderCommonStyleEditors = () => (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-3">
        <div>
            <label htmlFor="fontSize" className={labelClass}>Font Size (px/em)</label>
            <input id="fontSize" type="text" value={style.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} placeholder="e.g., 16px" className={inputClass} />
        </div>
        <div>
            <label htmlFor="color" className={labelClass}>Text/Icon Color</label>
            <input id="color" type="color" value={style.color || '#FFFFFF'} onChange={e => handleStyleChange('color', e.target.value)} className={`${inputClass} h-9 p-0.5`} />
        </div>
        { component.type !== 'icon' && component.type !== 'discordBox' && ( // Background not typical for plain icon/discord iframes
             <div>
                <label htmlFor="backgroundColor" className={labelClass}>Background Color</label>
                <input id="backgroundColor" type="color" value={style.backgroundColor || '#000000'} onChange={e => handleStyleChange('backgroundColor', e.target.value)} className={`${inputClass} h-9 p-0.5`} />
            </div>
        )}
         <div>
            <label htmlFor="textAlign" className={labelClass}>Text Align</label>
            <select id="textAlign" value={style.textAlign || 'left'} onChange={e => handleStyleChange('textAlign', e.target.value as StyleObjectType['textAlign'])} className={inputClass}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
            </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-3">
        <div>
            <label htmlFor="padding" className={labelClass}>Padding (px/em)</label>
            <input id="padding" type="text" value={style.padding || ''} onChange={e => handleStyleChange('padding', e.target.value)} placeholder="e.g., 10px" className={inputClass} />
        </div>
        <div>
            <label htmlFor="margin" className={labelClass}>Margin (px/em)</label>
            <input id="margin" type="text" value={style.margin || ''} onChange={e => handleStyleChange('margin', e.target.value)} placeholder="e.g., 0 auto" className={inputClass} />
        </div>
      </div>
       <div className="grid grid-cols-2 gap-x-3 gap-y-3 mb-3">
        <div>
            <label htmlFor="width" className={labelClass}>Width (px/%)</label>
            <input id="width" type="text" value={style.width || ''} onChange={e => handleStyleChange('width', e.target.value)} placeholder="e.g., 100%" className={inputClass} />
        </div>
        <div>
            <label htmlFor="height" className={labelClass}>Height (px/%)</label>
            <input id="height" type="text" value={style.height || ''} onChange={e => handleStyleChange('height', e.target.value)} placeholder="e.g., auto" className={inputClass} />
        </div>
      </div>
      <div>
            <label htmlFor="borderRadius" className={labelClass}>Border Radius (px/%)</label>
            <input id="borderRadius" type="text" value={style.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} placeholder="e.g., 5px" className={inputClass} />
      </div>
      {component.type === 'icon' && (
         <div className="mt-3">
            <label htmlFor="verticalAlign" className={labelClass}>Vertical Align</label>
            <select id="verticalAlign" value={style.verticalAlign || 'middle'} onChange={e => handleStyleChange('verticalAlign', e.target.value as StyleObjectType['verticalAlign'])} className={inputClass}>
                <option value="baseline">Baseline</option>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
                <option value="text-top">Text Top</option>
                <option value="text-bottom">Text Bottom</option>
            </select>
        </div>
      )}
    </>
  );

  const renderSpecificPropEditors = () => {
    switch (component.type) {
      case 'text':
        const textProps = props as TextComponentProps;
        return (
          <div>
            <label htmlFor="text" className={labelClass}>Text Content</label>
            <textarea id="text" value={textProps.text} onChange={e => handlePropChange('text', e.target.value)} className={`${inputClass} h-24`} rows={3}></textarea>
          </div>
        );
      case 'button':
        const buttonProps = props as ButtonComponentProps;
        return (
          <>
            <div>
              <label htmlFor="label" className={labelClass}>Button Label</label>
              <input id="label" type="text" value={buttonProps.label} onChange={e => handlePropChange('label', e.target.value)} className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="actionUrl" className={labelClass}>Action URL (optional)</label>
              <input id="actionUrl" type="url" value={buttonProps.actionUrl || ''} onChange={e => handlePropChange('actionUrl', e.target.value)} placeholder="https://example.com" className={inputClass} />
            </div>
          </>
        );
      case 'image':
        const imageProps = props as ImageComponentProps;
        return (
          <>
            <div>
              <label htmlFor="src" className={labelClass}>Image URL</label>
              <input id="src" type="url" value={imageProps.src} onChange={e => handlePropChange('src', e.target.value)} className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="alt" className={labelClass}>Alt Text</label>
              <input id="alt" type="text" value={imageProps.alt} onChange={e => handlePropChange('alt', e.target.value)} className={inputClass} />
            </div>
          </>
        );
      case 'icon':
        const iconProps = props as IconComponentProps;
        return (
          <div>
            <label htmlFor="iconIdentifier" className={labelClass}>Icon Identifier</label>
            <input id="iconIdentifier" type="text" value={iconProps.iconIdentifier} onChange={e => handlePropChange('iconIdentifier', e.target.value)} placeholder="e.g., star, fa-home, SVG data" className={inputClass} />
             <p className="text-xs text-neutral-500 mt-1">Use 'star', 'heart', 'check', 'xmark' or paste SVG path data (e.g., M10 15...)</p>
          </div>
        );
      case 'file':
        const fileProps = props as FileComponentProps;
        return (
          <>
            <div>
              <label htmlFor="fileName" className={labelClass}>Display Text</label>
              <input id="fileName" type="text" value={fileProps.fileName} onChange={e => handlePropChange('fileName', e.target.value)} className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="fileUrl" className={labelClass}>File URL</label>
              <input id="fileUrl" type="url" value={fileProps.fileUrl} onChange={e => handlePropChange('fileUrl', e.target.value)} placeholder="https://example.com/file.pdf" className={inputClass} />
            </div>
          </>
        );
      case 'downloadButton':
        const downloadProps = props as DownloadFileButtonProps;
        return (
          <>
            <div>
              <label htmlFor="buttonLabel" className={labelClass}>Button Label</label>
              <input id="buttonLabel" type="text" value={downloadProps.buttonLabel} onChange={e => handlePropChange('buttonLabel', e.target.value)} className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="fileUrl" className={labelClass}>File URL</label>
              <input id="fileUrl" type="url" value={downloadProps.fileUrl} onChange={e => handlePropChange('fileUrl', e.target.value)} placeholder="https://example.com/archive.zip" className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="fileNameToDownload" className={labelClass}>Download As (Filename)</label>
              <input id="fileNameToDownload" type="text" value={downloadProps.fileNameToDownload} onChange={e => handlePropChange('fileNameToDownload', e.target.value)} placeholder="my_file.zip" className={inputClass} />
            </div>
          </>
        );
      case 'discordBox':
        const discordProps = props as DiscordServerBoxProps;
        return (
          <>
            <div>
              <label htmlFor="serverId" className={labelClass}>Discord Server ID</label>
              <input id="serverId" type="text" value={discordProps.serverId} onChange={e => handlePropChange('serverId', e.target.value)} placeholder="e.g., 123456789012345678" className={inputClass} />
            </div>
            <div className="mt-3">
              <label htmlFor="theme" className={labelClass}>Theme</label>
              <select id="theme" value={discordProps.theme || 'dark'} onChange={e => handlePropChange('theme', e.target.value as 'dark' | 'light')} className={inputClass}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </>
        );
      default:
        return <p className="text-neutral-500 text-sm">No specific properties for this component type.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-neutral-100 mb-1">Editing: <span className="capitalize text-sky-400">{component.type}</span></h3>
        <p className="text-xs text-neutral-500 mb-3">ID: {component.id}</p>
      </div>
      
      <div className="space-y-3 border-t border-neutral-800 pt-4">
         <h4 className="text-sm font-medium text-neutral-300 mb-2">Content & Specifics</h4>
        {renderSpecificPropEditors()}
      </div>

      <div className="space-y-1 border-t border-neutral-800 pt-4">
        <h4 className="text-sm font-medium text-neutral-300 mb-2">General Styling</h4>
        {renderCommonStyleEditors()}
      </div>
    </div>
  );
};

export default PropertiesPanel;