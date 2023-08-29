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
