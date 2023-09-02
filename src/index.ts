// api-sdk/src/index.ts
import * as Errors from "./error";
import {
  v2Content,
  v3Content,
  alphaContent,
  largeContent,
} from "./ai/content-generation";
import { v2ImageGen, v3ImageGen } from "./ai/image-generation";
import { contentModeration, imageModeration } from "./ai/moderation";
import { deleteTrainedDatasets, viewTrainedDatasets } from "./ai/datasets";
import { v2Search, v3Search } from "./ai/search";
import { authenticate } from "./auth/authentication";
import {
  webExtraction,
  PDFExtraction,
  imageExtraction,
  speechExtraction,
} from "./ai/text-extraction";
import {
  analyseImagesProcess,
  detectFaces,
  compareFaces,
} from "./ai/image-analysis";
import {
  imageModificationV2,
  imageModificationV3,
  imageUpscaler,
} from "./ai/img2img";

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
   * The maximum number of retries to attempt for a request.
   * @type {number}
   * @default 3
   * */
  max_retries: number;
  /**
   * Initializes a new instance of the Configuration class.
   *
   * @param options - An object containing the configuration options.
   * @param options.apiKey - The API key used for authentication. This key is required to access the API services.
   * @param options.debug - Optional. A boolean value that controls the logging of detailed process steps. If true, the application will log detailed process steps. If false or not provided, the application will not log these details.
   *
   * @throws {Error} Will throw an error if the apiKey is not provided or if it is not a string.
   */
  constructor(options: {
    apiKey: string;
    debug?: boolean;
    max_retries?: number;
  }) {
    this.apiKey = options.apiKey || process.env.WORQHAT_API_KEY || "";
    this.debug = options.debug || false;
    this.max_retries = 2;

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
 * @example
 * ```javascript
 * const worqhat = require('worqhat');
 *
 * var config = new worqhat.Configuration({
 *   apiKey: "your-api-key",
 *   debug: true,
 * });
 *
 * worqhat.initializeApp(config)
 *   .then(() => console.log("App initialized successfully"))
 *   .catch((error) => console.error("Error initializing app:", error));
 * ```
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
 * @example
 * ```javascript
 * const worqhat = require('worqhat');
 *
 * var config = new worqhat.Configuration({
 *   apiKey: "your-api-key",
 *   debug: true,
 * });
 *
 * worqhat.initializeApp(config);
 *
 * async function checkAuth() {
 *   try {
 *     var result = await worqhat.checkAuthentication();
 *     console.log(result);
 *
 *   } catch (error) {
 *     console.error(error);
 *   }
 * }
 *
 * checkAuth();
 * ```
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
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateContent() {
   *   try {
   *     var result = await worqhat.contentGeneration.v2({
   *       history_object: { "previous": "Previous conversation history" },
   *       preserve_history: true,
   *       question: "Your question here",
   *       training_data: "your-training-data-id",
   *       randomness: 0.3,
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateContent();
   * ```
   */
  v2: v2Content,
  /**
   * Version 3 Advanced Generation AI focused for more creative and understanding capabilities. It can be used to generate content for a variety of use cases where the content is more creative or complex. It can run complex situational analysis and understand the context of the commands. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v3-textgen
   * @param history_object: An object representing the history of the conversation. Default is undefined.
   * @param preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
   * @param question: A string representing the question to generate content for. Default is undefined.
   * @param training_data: A string representing the training data to use for generating content. Default is undefined.
   * @param randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateContent() {
   *   try {
   *     var result = await worqhat.contentGeneration.v3({
   *       history_object: { "previous": "Previous conversation history" },
   *       preserve_history: true,
   *       question: "Your question here",
   *       training_data: "your-training-data-id",
   *       randomness: 0.3,
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateContent();
   * ```
   */
  v3: v3Content,
  /**
   * Alpha version Content Generation AI with data upto 2023 which can be used to generate Current Data based content. The Alpha Channel of AiCon V2 is mostly dependent on the Data upto May 2023 which makes it relatively upto date and more accurate than the previous versions of AiCon. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-2023-alpha
   * @param question: A string representing the question to generate content for. Default is undefined.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateAlphaContent() {
   *   try {
   *     var result = await worqhat.contentGeneration.alpha({
   *       question: "Your question here",
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateAlphaContent();
   * ```
   */
  alpha: alphaContent,
  /**
   * Large Content Generation AI Model. This model is designed to generate large amounts of content based on the provided parameters. You can provide a pre-trained model to generate content on top of it. This is mostly used for use-cases where you want to run a model based on your pre-trained dataset. It can be used to generate content for a variety of use cases where the content is more creative or complex.
   *  Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-large-beta
   * @param {string} datasetId - The id of the dataset to be used for content generation. This is a required parameter.
   * @param {string} question - The question or prompt based on which the content will be generated. This is a required parameter.
   * @param {number} randomness - A number representing the level of randomness to use for generating content. Default is 0.2.
   * @param {array} instructions - An array of strings representing the instructions for the content generation. Default is undefined.
   * @returns {Promise} A Promise that resolves to the generated content.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateLargeContent() {
   *   try {
   *     var result = await worqhat.contentGeneration.large({
   *       datasetId: "your-dataset-id",
   *       question: "Your question here",
   *       randomness: 0.3,
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateLargeContent();
   * ```
   */
  large: largeContent,
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
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function search() {
   *   try {
   *     var result = await worqhat.search.v2({
   *       question: "Your search query here",
   *       training_data: "your-training-data-id"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * search();
   * ```
   */
  v2: v2Search,
  /**
   * Search function for API v3. Meaning and Context Based Search experience powered by AI. Suitable for use cases where you want to return the most relevant results. Read more at https://docs.worqhat.com/ai-models/ai-for-search/search-v3
   * @param question - The search query string.
   * @param training_data - Contains the Referenced Dataset Id for the pre-trained dataset.
   * @param search_count - Returns the number of parameters we want to return. Default is 3. You can return as many as you want, but the more you return, the longer it will take.
   * @returns A Promise that resolves to the search results.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function search() {
   *   try {
   *     var result = await worqhat.search.v3({
   *       question: "Your search query here",
   *       training_data: "your-training-data-id",
   *       search_count: 5
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * search();
   * ```
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
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateImage() {
   *   try {
   *     var result = await worqhat.imageGeneration.v2({
   *       orientation: "Square",
   *       image_style: "default",
   *       output_type: "url",
   *       prompt: ["Your prompt here"]
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateImage();
   * ```
   */
  v2: v2ImageGen,
  /**
   * Version 3 Advanced Image Generation AI focused on more creative capabilities and complex realistic images. It is the larger image model with squares of max 1024px and rectangles of max 1344px on the longest side. It is slower and suitable for more complex use cases where more details are required. Read more at https://docs.worqhat.com/ai-models/image-generation/imagecon-v3
   * @param orientation: A string representing the orientation of the image. You can choose between ``Landscape``, ``Portrait`` or ``Square``.  Default is "Square".
   * @param image_style: A string representing the style of the image. Default is "default".
   * @param output_type: A string representing the output type of the image. You can choose between ``url`` or ``blob``. The``url`` parameter returns the Cloud Hosted Link to the Image, ``blob`` returns the Base64 Image. Default is "url".
   * @param prompt: An array of strings representing the prompts for the image generation. This is a required parameter.
   * @returns A Promise that resolves to the generated image.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function generateImage() {
   *   try {
   *     var result = await worqhat.imageGeneration.v3({
   *       orientation: "Landscape",
   *       image_style: "default",
   *       output_type: "url",
   *       prompt: ["Your prompt here"]
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * generateImage();
   * ```
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
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function moderateContent() {
   *   try {
   *     var result = await worqhat.moderation.content({
   *       text_content: "Your text content here"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * moderateContent();
   * ```
   */
  content: contentModeration,
  /**
   * Image Moderation AI Models. A powerful AI Model that can be used to detect and filter out inappropriate content from your website or app. Read more at https://docs.worqhat.com/ai-models/content-moderation/image-moderation
   * @param image - The image to be moderated. It can be a `File object` or a `URL` or `base64` encoded image data.
   * @returns A Promise that resolves to the moderation results.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function moderateImage() {
   *   try {
   *     var result = await worqhat.moderation.image({
   *       image: "./path-to-your-image.png"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * moderateImage();
   * ```
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
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function deleteDataset() {
   *   try {
   *     var result = await worqhat.datasets.delete({
   *      datasetId: "your-dataset-id"
   * });
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * deleteDataset();
   * ```
   */
  delete: deleteTrainedDatasets,
  /**
   * Function for viewing all trained datasets. It can access the Datasets API to retrieve a list of all datasets that you have trained for both AI and Search Interfaces. However, you will only be able to view datasets that you have created or have access to.
   *
   * @function list
   * @memberof datasets
   * @returns {Promise} A Promise that resolves to an array of dataset objects.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function listDatasets() {
   *   try {
   *     var datasets = await worqhat.datasets.list();
   *     console.log(datasets);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * listDatasets();
   * ```
   */
  list: viewTrainedDatasets,
};

/**
 * The `textExtraction` object contains functions for extracting text from different sources.
 * It has access to the following functions:
 * - web: Function for extracting text from web pages.
 * - pdf: Function for extracting text from PDF files.
 * - image: Function for extracting text from images.
 *
 * @namespace textExtraction
 * @property {function} web - Function for extracting text from web pages.
 * @property {function} pdf - Function for extracting text from PDF files.
 * @property {function} image - Function for extracting text from images.
 */
export const textExtraction = {
  /**
   * Function for extracting text from web pages. It sends a request to the Web Extraction AI Model and returns the extracted text. Key components such as headlines, paragraphs, images, and tables are identified, and the algorithm extracts them in a structured format like JSON. Additionally, the extracted data is cleaned and normalized to enhance its usability for analysis and processing purposes. Read more at: https://docs.worqhat.com/ai-models/text-extraction/web-extraction
   * @param code_blocks - A boolean indicating whether to extract code blocks. Default is false.
   * @param headline - A boolean indicating whether to extract headlines. Default is false.
   * @param inline_code - A boolean indicating whether to extract inline code. Default is false.
   * @param references - A boolean indicating whether to extract references. Default is false.
   * @param url_path - A string representing the URL of the web page to extract text from. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the extracted text.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function extractTextFromWeb() {
   *   try {
   *     var result = await worqhat.textExtraction.web({
   *       code_blocks: true,
   *      headline: true,
   *     inline_code: true,
   *    references: true,
   *      url_path: "https://www.your-website.com"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * extractTextFromWeb();
   * ```
   */
  web: webExtraction,
  /**
   * Function for extracting text from PDF files. It sends a request to the PDF Extraction AI Model and returns the extracted text. Read more at: https://docs.worqhat.com/ai-models/text-extraction/pdf-extraction
   * @param file - An object representing the PDF file to extract text from. It contains the path and name of the file. This is a required parameter.
   * @param output_format - A string representing the output format of the extracted text. You can choose between ``text`` or ``json``. This is a required parameter. It defaults to ``text``.
   * @returns {Promise} A Promise that resolves to the extracted text.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function extractTextFromPdf() {
   *   try {
   *     var result = await worqhat.textExtraction.pdf({
   *       file: "./path-to-your-pdf-file.pdf",
   *       output_format: "text"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * extractTextFromPdf();
   * ```
   */
  pdf: PDFExtraction,
  /**
   * Function for extracting text from images. It sends a request to the Image Extraction AI Model and returns the extracted text. Read more about the Models and their use cases at: https://docs.worqhat.com/ai-models/text-extraction/image-extraction
   * @param image - The image to extract text from. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @param output_format - A string representing the output format of the extracted text. You can choose between ``text`` or ``json``. This is a required parameter. It defaults to ``json``.
   * @returns {Promise} A Promise that resolves to the extracted text.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function extractTextFromImage() {
   *   try {
   *     var result = await worqhat.textExtraction.image({
   *       image: "./path-to-your-image.png",
   *      output_format: "json"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * extractTextFromImage();
   * ```
   */
  image: imageExtraction,
  /**
   * Function for extracting text from speech. It sends a request to the Speech Extraction AI Model and returns the extracted text. Read more about the Models and their use cases at: https://docs.worqhat.com/ai-models/speech-extraction
   * @param audio - The audio to extract text from. It can be a `File Path`. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the extracted text.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function extractSpeech() {
   *   try {
   *     var result = await worqhat.textExtraction.speech({
   *       audio: "./path-to-your-audio-file.wav"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * extractSpeech();
   * ```
   **/
  speech: speechExtraction,
};

/**
 * The `analyseImages` object contains functions for analysing images, detecting faces in images, and comparing faces in images.
 * It has access to the following functions:
 * - analyse: Function for analysing images.
 * - detectFaces: Function for detecting faces in images.
 * - compareFaces: Function for comparing faces in images.
 *
 * @namespace analyseImages
 * @property {function} analyse - Function for analysing images.
 * @property {function} detectFaces - Function for detecting faces in images.
 * @property {function} compareFaces - Function for comparing faces in images.
 *
 **/
export const analyseImages = {
  /**
   * Function for analysing images. It sends a request to the Image Analysis AI Model and returns the analysis results. they can detect a wide range of labels, numbering in the thousands. These labels encompass objects such as “Palm Tree,” scenes like “Beach,” actions such as “Running,” and concepts like “Outdoors”. Also analyze various image properties using computer vision techniques. These properties include foreground and background colors, sharpness, brightness, and contrast. By analyzing these properties, the models gain further insights into the visual characteristics and qualities of the image. Read more at https://docs.worqhat.com/ai-models/image-analysis/image-analysis-v2
   * @param image - The image to be analysed. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the analysis results.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function analyseImage() {
   *   try {
   *     var result = await worqhat.analyseImages.analyse({
   *       image: "./path-to-your-image.png"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * analyseImage();
   * ```
   */
  analyse: analyseImagesProcess,
  /**
   * Function for detecting faces in images. You can detect faces within an image, and obtain valuable information about those faces. This includes the location of detected faces, facial landmarks such as the position of eyes, and attributes such as emotions (e.g., happiness or sadness) and the presence of glasses or face occlusion.. It sends a request to the Face Detection AI Model and returns the detection results. Read more at https://docs.worqhat.com/ai-models/image-analysis/face-analysis
   * @param image - The image to be analysed. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the detection results.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function detectFaces() {
   *   try {
   *     var result = await worqhat.analyseImages.detectFaces({
   *       image: "./path-to-your-image.png"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * detectFaces();
   * ```
   */
  detectFaces: detectFaces,
  /**
   * Function for Detecting faces in images and comparing them with other faces in a Database or another image. It sends a process request to the Face Comparison AI Model and returns the comparison results. Read more at https://docs.worqhat.com/ai-models/image-analysis/face-comparison-v2
   * @param source_image - The source image to be compared. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @param target_image - The target image to be compared. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the comparison results.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function compareFaces() {
   *   try {
   *     var result = await worqhat.analyseImages.compareFaces({
   *       source_image: "./path-to-source-image.png",
   *       target_image: "./path-to-target-image.png"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * compareFaces();
   * ```
   */
  compareFaces: compareFaces,
};

/**
 * The `imageVariations` object contains functions for modifying images using different versions of the API and for upscaling images.
 * It has access to the following functions:
 * - v2: Function for modifying images using version 2 of the AI Image Model and it carries the inherent features of the model.
 * - v3: Function for modifying images using version 3 of the API and it carries the inherent features of the model.
 * - upscale: Function for upscaling images upto 4x or maximum size of 2048px using the AI Image Upscaler Model.
 *
 * @namespace imageVariations
 * @property {function} v2 - Function for modifying images using version 2 of the API.
 * @property {function} v3 - Function for modifying images using version 3 of the API.
 * @property {function} upscale - Function for upscaling images.
 */
export const imageVariations = {
  /**
   * Function for modifying images using version 2 of the API. It sends a request to the Image Modification V2 AI Model and returns the new image. Read more at https://docs.worqhat.com/ai-models/image-generation/image-image-v2
   * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @param {string} modifications - The modifications to be made to the image. This is a required parameter.
   * @param {"url" | "blob"} outputType - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
   * @param {number} similarity - The similarity percentage for the image modification. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the modified image.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function modifyImage() {
   *   try {
   *     var result = await worqhat.imageVariations.v2({
   *       existing_image: "./path-to-your-image.png",
   *       modifications: "your modifications",
   *       outputType: "url",
   *       similarity: 80
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * modifyImage();
   * ```
   */
  v2: imageModificationV2,
  /**
   * Function for modifying images using version 3 of the API. It sends a request to the Image Modification V3 AI Model and returns the new image. Read more about the Model at https://docs.worqhat.com/ai-models/image-generation/image-image-v3
   * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @param {string} modifications - The modifications to be made to the image. This is a required parameter.
   * @param {"url" | "blob"} outputType - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
   * @param {number} similarity - The similarity percentage for the image modification. This is a required parameter.
   * @returns {Promise} A Promise that resolves to the modified image.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function modifyImage() {
   *   try {
   *     var result = await worqhat.imageVariations.v3({
   *       existing_image: "./path-to-your-image.png",
   *       modifications: "your modifications",
   *       outputType: "url",
   *       similarity: 80
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * modifyImage();
   * ```
   */
  v3: imageModificationV3,
  /**
   * Function for upscaling images using the AI Image Upscaler Model. It sends a request to the Image Upscaler AI Model and returns the upscaled image. Read more at https://docs.worqhat.com/ai-models/image-generation/image-upscale
   * @param {File | string} existing_image - The existing image to be upscaled. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
   * @param {number} scale - The scale factor for the image upscaling. This is an optional parameter. Make sure to use a value between 1 and 4 so that it does not scale one side beyond 2048px.
   * @param {"url" | "blob"} output_type - The output type of the upscaled image. It can be either "url" or "blob". This is an optional parameter.
   * @returns {Promise} A Promise that resolves to the upscaled image.
   * @example
   * ```javascript
   * const worqhat = require('worqhat');
   *
   * var config = new worqhat.Configuration({
   *   apiKey: "your-api-key",
   *   debug: true,
   * });
   *
   * worqhat.initializeApp(config);
   *
   * async function upscaleImage() {
   *   try {
   *     var result = await worqhat.imageVariations.upscale({
   *       existing_image: "./path-to-your-image.png",
   *       scale: 2,
   *       output_type: "url"
   *     })
   *     console.log(result);
   *
   *   } catch (error) {
   *     console.error(error);
   *   }
   * }
   *
   * upscaleImage();
   * ```
   */
  upscale: imageUpscaler,
};

export const trainingData = {};

export default {
  checkAuthentication,
  initializeApp,
};
