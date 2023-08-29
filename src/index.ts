// api-sdk/src/index.ts
import * as Errors from "./error";
import { v2Content, v3Content, alphaContent } from "./ai/content-generation";
import { v2ImageGen, v3ImageGen } from "./ai/image-generation";
import { contentModeration } from "./ai/moderation";
import { v2Search, v3Search } from "./ai/search";
import { authenticate } from "./auth/authentication";

/* The Configuration class is used to store and validate an API key. */
export class Configuration {
  /**
   * Configuration class to store and validate an API key.
   */
  apiKey: string;

  /**
   * Initializes the Configuration object with the provided apiKey.
   * Throws an error if the apiKey is missing or not a string.
   * @param options - The options object with an apiKey property.
   */
  constructor(options: { apiKey: string }) {
    this.apiKey = options.apiKey;

    if (!this.apiKey) {
      throw new Error("API Key is required");
    }

    if (typeof this.apiKey !== "string") {
      throw new Error("API Key must be a string");
    }
  }
}

export let appConfiguration: Configuration | null = null;

/**
 * The function `initializeApp` takes a configuration object as a parameter, sets it as the app
 * configuration, and returns a promise that resolves to true.
 * @param {Configuration} configuration - The `configuration` parameter is an object that contains the
 * necessary settings and options for initializing the app. It is of type `Configuration`.
 * @returns A Promise is being returned.
 */
export const initializeApp = (configuration: Configuration) => {
  appConfiguration = configuration;
  return new Promise((resolve, reject) => {
    try {
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * The function checks if the app is initialized and returns an error if not, otherwise it
 * authenticates using the app's API key and returns the response.
 * @returns either an error object or a response object.
 */
export const checkAuthentication = () => {
  if (!appConfiguration) {
    var error = Errors.APIError.generate(
      400,
      { error: "Bad Request" },
      "App is not initialized. Call initializeApp first.",
    );
    return error;
  }
  var response = authenticate(appConfiguration.apiKey);
  return response;
};

/**
 * These functions can be used to generate text content using different AI models. The available versions include v2, v3, and alpha.
 * It has access to the following functions:
 * - v2: Version 2 Content Generation AI focused only on Business Content Generation Purpose.
 * - v3: Version 3 Advanced Generation AI focused for more creative and understanding capabilities.
 * - alpha: Alpha version Content Generation AI with data upto 2023 which can be used to generate Current Data based content.
 * Object containing different versions of Content Generation AI.
 */
export const contentGeneration = {
  /**
   * Version 2 Content Generation AI focused only on Business Content Generation Purpose. It can be used to generate content for a variety of business use cases where the content is not too creative or complex. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-textgen
   * @param options - An object containing the following  parameters:
   * @param history_object: An object representing the history of the conversation. Default is undefined.
   * @param preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
   * @param question: A string representing the question to generate content for. Default is undefined.
   * @param training_data: A string representing the training data to use for generating content. Default is undefined.
   * @param randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
   */
  v2: v2Content,
  /**
   * Version 3 Advanced Generation AI focused for more creative and understanding capabilities. It can be used to generate content for a variety of use cases where the content is more creative or complex. It can run complex situational analysis and understand the context of the commands. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v3-textgen
   * @param history_object: An object representing the history of the conversation. Default is undefined.
   * @param preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
   * @param question: A string representing the question to generate content for. Default is undefined.
   * @param training_data: A string representing the training data to use for generating content. Default is undefined.
   * @param randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
   */
  v3: v3Content,
  /**
   * Alpha version Content Generation AI with data upto 2023 which can be used to generate Current Data based content. The Alpha Channel of AiCon V2 is mostly dependent on the Data upto May 2023 which makes it relatively upto date and more accurate than the previous versions of AiCon. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-2023-alpha
   * @param question: A string representing the question to generate content for. Default is undefined.
   */
  alpha: alphaContent,
};

/**
 * The search object contains functions for searching using different versions of the API.
 * This is a module that exports a namespace containing search functions for different API versions, which can be used to enable search experiences.
 * It has access to the following functions:
 * - v2: Search function for API v2. AI assisted Text Based Search Engine.
 * - v3: Search function for API v3. Meaning and Context Based Search experience powered by AI
 */
export const search = {
  /**
   * Search function for API v2. AI assisted Text Based Search Engine. Read more at https://docs.worqhat.com/ai-models/ai-for-search/search-v2
   * @param question - The search query string.
   * @param training_data - Contains the Referenced Dataset Id for the pre-trained dataset.
   * @returns A Promise that resolves to the search results. By default it returns all the results that match the query.
   */
  v2: v2Search,
  /**
   * Search function for API v3. Meaning and Context Based Search experience powered by AI. Suitable for use cases where you want to return the most relevant results. Read more at https://docs.worqhat.com/ai-models/ai-for-search/search-v3
   * @param question - The search query string.
   * @param training_data - Contains the Referenced Dataset Id for the pre-trained dataset.
   * @param search_count - Returns the number of parameters we want to return. Default is 3. You can return as many as you want, but the more you return, the longer it will take.
   * @returns A Promise that resolves to the search results.
   */
  v3: v3Search,
};

/**
 * These functions can be used to generate images using different AI models. The available versions include v2 and v3.
 * It has access to the following functions:
 * - v2: 768px Max Width Image Models Version 2 Image Generation AI focused on generating images based on provided parameters.
 * - v3: 1344px Max Width Upscaled Image Models Version 3 Advanced Image Generation AI focused on more creative capabilities and complex realistic images.
 * Object containing different versions of Image Generation AI.
 */
export const imageGeneration = {
  /**
   * Version 2 Image Generation AI focused on generating images based on provided parameters. It is the smaller image model with squares of max 512px and rectangles of max 768px on the longest side. It is faster and suitable for most use cases. Read more at https://docs.worqhat.com/ai-models/image-generation/imagecon-v2
   * @param orientation: A string representing the orientation of the image. You can choose between ``Landscape``, ``Portrait`` or ``Square``.  Default is "Square".
   * @param image_style: A string representing the style of the image. Default is "default".
   * @param output_type: A string representing the output type of the image. You can choose between ``url`` or ``blob``. The``url`` parameter returns the Cloud Hosted Link to the Image, ``blob`` returns the Base64 Image. Default is "url".
   * @param prompt: An array of strings representing the prompts for the image generation. This is a required parameter.
   * @returns A Promise that resolves to the generated image.
   */
  v2: v2ImageGen,
  /**
   * Version 3 Advanced Image Generation AI focused on more creative capabilities and complex realistic images. It is the larger image model with squares of max 1024px and rectangles of max 1344px on the longest side. It is slower and suitable for more complex use cases where more details are required. Read more at https://docs.worqhat.com/ai-models/image-generation/imagecon-v3
   * @param orientation: A string representing the orientation of the image. You can choose between ``Landscape``, ``Portrait`` or ``Square``.  Default is "Square".
   * @param image_style: A string representing the style of the image. Default is "default".
   * @param output_type: A string representing the output type of the image. You can choose between ``url`` or ``blob``. The``url`` parameter returns the Cloud Hosted Link to the Image, ``blob`` returns the Base64 Image. Default is "url".
   * @param prompt: An array of strings representing the prompts for the image generation. This is a required parameter.
   * @returns A Promise that resolves to the generated image.
   */
  v3: v3ImageGen,
};

export const moderation = {
  content: contentModeration,
};

export default {
  checkAuthentication,
  initializeApp,
};
