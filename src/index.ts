// api-sdk/src/index.ts
import * as Errors from "./error";
import { v2Content, v3Content, alphaContent } from "./ai/content-generation";
import { v2ImageGen, v3ImageGen } from "./ai/image-generation";
import { contentModeration, imageModeration } from "./ai/moderation";
import { deleteTrainedDatasets, viewTrainedDatasets } from "./ai/datasets";
import { v2Search, v3Search } from "./ai/search";
import { authenticate } from "./auth/authentication";

/* The Configuration class is used to store and validate an API key. */
export class Configuration {
  /**
   * The API key used for authentication.
   * This key is required to access the API services.
   * @type {string}
   */
  apiKey: string;
  /**
   * Debug property that can be either true or false.
   * If true, the application will log detailed process steps.
   * If false, the application will stop logging.
   * @type {boolean}
   */
  debug: boolean;
  /**
   * Initializes a new instance of the Configuration class.
   *
   * @param options - An object containing the configuration options.
   * @param options.apiKey - The API key used for authentication. This key is required to access the API services.
   * @param options.debug - Optional. A boolean value that controls the logging of detailed process steps. If true, the application will log detailed process steps. If false or not provided, the application will not log these details.
   *
   * @throws {Error} Will throw an error if the apiKey is not provided or if it is not a string.
   */
  constructor(options: { apiKey: string; debug?: boolean }) {
    this.apiKey = options.apiKey;
    this.debug = options.debug || false;

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

/**
 * The `moderation` object contains functions for moderating both content and images.
 * It has access to the following functions:
 * - content: Function for moderating content. It checks the content for any inappropriate or harmful material and returns a report.
 * - image: Function for moderating images. It checks the images for any inappropriate or harmful material and returns a report.
 *
 * @namespace moderation
 * @property {function} content - Function for moderating content.
 * @property {function} image - Function for moderating images.
 */
export const moderation = {
  /**
   * Content Moderation AI Models. A powerful AI Model that can be used to detect and filter out inappropriate content from your website or app. Read more at https://docs.worqhat.com/ai-models/content-moderation/text-content-moderation
   * @param text_content - The text content to be moderated.
   * @returns A Promise that resolves to the moderation results.
   */
  content: contentModeration,
  /**
   * Image Moderation AI Models. A powerful AI Model that can be used to detect and filter out inappropriate content from your website or app. Read more at https://docs.worqhat.com/ai-models/content-moderation/image-moderation
   * @param image - The image to be moderated. It can be a `File object` or a `URL` or `base64` encoded image data.
   * @returns A Promise that resolves to the moderation results.
   */
  image: imageModeration,
};

/**
 * The `datasets` object contains functions for managing trained datasets. It can access the Datasets API to manage datasets that you have trained for both AI and Search Interfaces. However, you will only be able to view and delete datasets that you have created or have access to.
 * It has access to the following functions:
 * - delete: Function for deleting trained datasets.
 * - list: Function for viewing all trained datasets that you have access to.
 *
 * @namespace datasets
 * @property {function} delete - Function for deleting trained datasets.
 * @property {function} list - Function for viewing all trained datasets.
 */
export const datasets = {
  /**
   * Function for deleting trained datasets. It can access the Datasets API to delete a dataset that you have trained for both AI and Search Interfaces. However, you will only be able to delete datasets that you have created or have access to.
   *
   * @function delete
   * @memberof datasets
   * @param {string} datasetId - The ID of the dataset to be deleted. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the deletion result.
   */
  delete: deleteTrainedDatasets,
  /**
   * Function for viewing all trained datasets. It can access the Datasets API to retrieve a list of all datasets that you have trained for both AI and Search Interfaces. However, you will only be able to view datasets that you have created or have access to.
   *
   * @function list
   * @memberof datasets
   * @returns {Promise} A Promise that resolves to an array of dataset objects.
   */
  list: viewTrainedDatasets,
};

export default {
  checkAuthentication,
  initializeApp,
};
