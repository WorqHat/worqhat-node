// api-sdk/src/index.ts
import * as Errors from './error';
import { contentModeration, imageModeration } from './ai/moderation';
import { authenticate } from './auth/authentication';
import { Database } from './databases/databases';
import { AI } from './ai/ai';

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
    this.apiKey = options.apiKey || process.env.WORQHAT_API_KEY || '';
    this.debug = options.debug || false;
    this.max_retries = 2;

    if (!this.apiKey) {
      throw new Error('API Key is required');
    }

    if (typeof this.apiKey !== 'string') {
      throw new Error('API Key must be a string');
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
      { error: 'Bad Request' },
      'App is not initialized. Call initializeApp first.',
    );
    return error;
  }
  var response = authenticate(appConfiguration.apiKey);
  return response;
};

export const database = (): Database => {
  console.log('Creating new Database Connection instance.');
  return new Database();
};

export const ai = () => {
  console.log('Creating new AI Connection instance.');
  return new AI();
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

export default {
  checkAuthentication,
  initializeApp,
};
