export type AccessLevel = 'User' | 'Enable' | 'Config' | 'Global' | 'VirtualSite';

export type CommandActionType = 'config' | 'show' | 'no' | 'clear' | 'action';

export interface CommandParameter {
  name: string;
  required: boolean;
  type: string; // e.g., 'IPv4/IPv6', 'string', 'integer (1-65535)', 'choice'
  defaultValue?: string;
  description: string;
  options?: string[];
  placeholder?: string;
}

export interface CommandExample {
  title: string;
  command: string;
  explanation: string;
  output?: string;
}

export interface ZTagCommand {
  id: string;
  syntax: string;
  name: string; // Primary command keyword e.g. "ip address"
  chapterId: string;
  chapterName: string;
  subCategory: string;
  accessLevel: AccessLevel;
  prompt: 'AN>' | 'AN#' | 'AN(config)#' | 'vs(config)$' | 'Global / Config';
  actionType: CommandActionType;
  description: string;
  descriptionZh: string;
  parameters: CommandParameter[];
  examples: CommandExample[];
  notices?: string[];
  relatedCommands?: string[];
  tags: string[];
}

export interface ChapterCategory {
  id: string;
  title: string;
  titleZh: string;
  iconName: string;
  count?: number;
}

export interface SnmpOidItem {
  oid: string;
  description: string;
  descriptionZh: string;
  category: string;
}

export interface ConfigurationRecipe {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: {
    step?: number;
    title: string;
    command: string;
    explanation: string;
  }[];
}

export type ZTagRecipe = ConfigurationRecipe;
