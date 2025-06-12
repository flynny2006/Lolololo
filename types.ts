import type { Session, User } from '@supabase/supabase-js';
export * from './types/supabase'; // For Supabase generated types

export type ComponentType = 'text' | 'button' | 'image' | 'icon' | 'file' | 'downloadButton' | 'discordBox';

export interface StyleObjectType {
  color?: string;
  backgroundColor?: string;
  fontSize?: string; // e.g., '16px', '1.2em'
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string; // e.g., '10px', '5px 10px'
  margin?: string; // e.g., '10px', '0 auto'
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontFamily?: string; // e.g., 'Arial, sans-serif'
  borderRadius?: string; // e.g., '5px'
  width?: string; // e.g., '100%', '200px'
  height?: string; // e.g., 'auto', '100px'
  verticalAlign?: 'baseline' | 'top' | 'middle' | 'bottom' | 'text-top' | 'text-bottom'; // For Icon
  // Add more style properties as needed
}

export interface BaseComponentProps {
  // Common props for all components can go here if any
}

export interface TextComponentProps extends BaseComponentProps {
  text: string;
}

export interface ButtonComponentProps extends BaseComponentProps {
  label: string;
  actionUrl?: string; // URL to navigate to on click
}

export interface ImageComponentProps extends BaseComponentProps {
  src: string;
  alt: string;
}

export interface IconComponentProps extends BaseComponentProps {
  iconIdentifier: string; // e.g., SVG path data, a class name, or a keyword for a predefined icon
  // For simplicity, we might start with a text input for SVG path or class name
}

export interface FileComponentProps extends BaseComponentProps {
  fileName: string; // Display name for the file link
  fileUrl: string; // URL to the file
}

export interface DownloadFileButtonProps extends BaseComponentProps {
  buttonLabel: string;
  fileUrl: string;
  fileNameToDownload: string; // Suggested name for the downloaded file
}

export interface DiscordServerBoxProps extends BaseComponentProps {
  serverId: string;
  theme?: 'dark' | 'light';
  // width and height can be controlled by general style props if needed
}


export type SpecificComponentProps =
  | TextComponentProps
  | ButtonComponentProps
  | ImageComponentProps
  | IconComponentProps
  | FileComponentProps
  | DownloadFileButtonProps
  | DiscordServerBoxProps;


export interface EditorComponentModel {
  id: string; // Unique ID for the component instance
  type: ComponentType;
  props: SpecificComponentProps;
  style: StyleObjectType;
}

// Updated Project type
export interface Project {
  id: string;
  user_id: string;
  website_name: string;
  developer_name: string;
  description: string;
  created_at: string;
  editor_content: EditorComponentModel[] | null; // Can be null if never edited
  published_content: EditorComponentModel[] | null; // Can be null if never published
  last_published_at: string | null; // Timestamp
}

export interface ProjectListButtonProps { // Renamed from ProjectListProps for clarity
  onOpenCreateModal: () => void;
}

export interface CreateWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: WebsiteCreationDetails) => Promise<void>;
  isSubmitting: boolean;
}

export interface WebsiteCreationDetails {
  websiteName: string;
  developerName: string;
  description: string;
}

export interface AuthComponentProps {
  onLoginSuccess: (session: Session) => void;
}

export type View = 'projectList' | 'editor' | 'siteViewer';

// Keep a reference to Supabase specific types for convenience if needed elsewhere
export type { Session, User };

export interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  publishedUrl: string;
}