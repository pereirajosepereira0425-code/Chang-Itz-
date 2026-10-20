export type FormatCategory = 
  | 'image'
  | 'vector'
  | 'video'
  | 'audio'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'data'
  | 'code'
  | 'archive'
  | 'font'
  | 'model'
  | 'database'
  | 'crypto'
  | 'units'
  | 'creative';

export interface FormatDefinition {
  id: string; // e.g. 'png', 'markdown', 'json'
  name: string;
  extension: string; // '.png'
  category: FormatCategory;
  mimeTypes: string[];
  description: string;
  emoji: string;
  isTextBased?: boolean;
  isBinary?: boolean;
}

export type OptionType = 'boolean' | 'select' | 'number' | 'text';

export interface ConversionOption {
  id: string;
  label: string;
  type: OptionType;
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export type ConversionParams = Record<string, any>;

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  stage?: string;
}

export interface ConversionResult {
  data: Blob | string | Uint8Array;
  outputName: string;
  outputFormat: string;
  mimeType: string;
  previewType: 'image' | 'audio' | 'text' | 'archive' | 'hex' | 'none';
  textContent?: string;
  previewUrl?: string;
  logs: LogEntry[];
  executionTimeMs: number;
  originalSizeBytes: number;
  convertedSizeBytes: number;
}

export interface ConversionJob {
  id: string;
  file: File;
  sourceFormat: string;
  targetFormat: string;
  status: 'idle' | 'converting' | 'success' | 'error';
  progress: number;
  result?: ConversionResult;
  error?: string;
  params: ConversionParams;
}

export interface FormatGraphNode {
  format: FormatDefinition;
  targets: string[]; // format IDs this format can be converted into
}
