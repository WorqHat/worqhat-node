// types.ts

export interface Configuration {
  apiKey: string;
}

export interface ContentGenerationParams {
  apiKey: string;
  conversation_history?: object[];
  preserve_history?: boolean;
  question?: string;
  training_data?: string;
  randomness?: number;
  stream?: boolean;
}

export interface AlphaParams {
  question: string;
  conversation_history?: object[];
  training_data?: string;
  retries?: number;
}

export interface searchV2Params {
  question: string;
  training_data?: string;
}

export interface searchV3Params {
  question: string;
  training_data?: string;
  search_count?: number;
}

export interface ImageGenV3Params {
  orientation?: 'Landscape' | 'Portrait' | 'Shape';
  image_style?: string;
  output_type?: 'url' | 'blob';
  prompt: any[];
}

export interface ImageGenV2Params {
  orientation?: 'Landscape' | 'Portrait' | 'Shape';
  image_style?: string;
  output_type?: 'url' | 'blob';
  prompt: any[];
}

export interface ContentModerationParams {
  text_content: string;
}

export interface ImageModerationParams {
  image: File | string;
}

export interface deleteDatasetParam {
  datasetId: string;
  retries?: number;
}

export interface LargeParams {
  datasetId: string;
  conversation_history?: object[];
  preserve_history?: boolean;
  question?: string;
  instructions?: string;
  randomness?: number;
  stream?: boolean;
  retries?: number;
}

export interface WebExtractionParams {
  code_blocks?: boolean;
  headline?: boolean;
  inline_code?: boolean;
  references?: boolean;
  url_path: string;
}

export interface PDFExtractionParams {
  file: File | string;
}

export interface ImageExtractionParams {
  image: File | string;
  output_format: 'text' | 'json';
}

export interface SpeechExtractionParams {
  audio: File | string;
}

export interface ImageAnalysisParams {
  image: File | string;
}

export interface DetectFacesParams {
  image: File | string;
}

export interface CompareFacesParams {
  source_image: File | string;
  target_image: File | string;
}

export interface ImageModificationParams {
  existing_image: File | string;
  modification: string;
  outputType?: 'url' | 'blob';
  similarity: number;
}

export interface ImageUpscaleParams {
  existing_image: File | string;
  scale?: number;
  output_type?: 'url' | 'blob';
}

export interface getUniqueQuery {
  uniqueColumn: string;
  orderByColumn: string;
  orderDirection: 'asc' | 'desc' | null;
}
