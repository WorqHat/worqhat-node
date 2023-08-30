// types.ts

export interface Configuration {
  apiKey: string;
}

export interface ContentGenerationParams {
  apiKey: string;
  history_object?: object;
  preserve_history?: boolean;
  question?: string;
  training_data?: string;
  randomness?: number;
}

export interface AlphaParams {
  question: string;
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
  orientation?: "Landscape" | "Portrait" | "Shape";
  image_style?: string;
  output_type?: "url" | "blob";
  prompt: any[];
}

export interface ImageGenV2Params {
  orientation?: "Landscape" | "Portrait" | "Shape";
  image_style?: string;
  output_type?: "url" | "blob";
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
}

export interface LargeParams {
  datasetId: string;
  question: string;
  randomness?: number;
}

export interface WebExtractionParams {
  code_blocks?: boolean;
  headline?: boolean;
  inline_code?: boolean;
  references?: boolean;
  url_path: string;
}

export interface PDFExtractionParams {
  file: {
    path: string;
    name: string;
  };
  output_format: "text" | "json";
}

export interface ImageExtractionParams {
  image: File | string;
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
