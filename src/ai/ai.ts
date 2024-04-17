import { contentModeration, imageModeration } from '../ai/moderation';
import {
  v2Content,
  v3Content,
  alphaContent,
  largeContent,
} from '../ai/content-generation';
import { v2ImageGen, v3ImageGen } from '../ai/image-generation';
import {
  deleteTrainedDatasets,
  viewTrainedDatasets,
  trainCustomDatasets,
} from '../ai/datasets';
import { v2Search, v3Search } from '../ai/search';
import {
  webExtraction,
  PDFExtraction,
  imageExtraction,
  speechExtraction,
} from '../ai/text-extraction';
import {
  analyseImagesProcess,
  detectFaces,
  compareFaces,
} from '../ai/image-analysis';
import {
  imageModificationV2,
  imageModificationV3,
  imageUpscaler,
  removeBackground,
  removeText,
} from '../ai/img2img';

export class AI {
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
  moderation = {
    /**
     * Content Moderation AI Models. A powerful AI Model that can be used to detect and filter out inappropriate content from your website or app. Read more at https://docs.worqhat.com/ai-models/content-moderation/text-content-moderation
     * @param {string} text_content - The text content to be moderated.
     * @link https://docs.worqhat.com/ai-models/content-moderation/text-content-moderation
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
     * let ai = worqhat.ai();
     *
     * ai.moderation.content({
     *  text_content: "Your text content here"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     *
     * ```
     */
    content: contentModeration,
    /**
     * Image Moderation AI Models. A powerful AI Model that can be used to detect and filter out inappropriate content from your website or app. Read more at https://docs.worqhat.com/ai-models/content-moderation/image-moderation
     * @param {string} image - The image to be moderated. It can be a `File object` or a `URL` or `base64` encoded image data.
     * @link https://docs.worqhat.com/ai-models/content-moderation/image-moderation
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
     * let ai = worqhat.ai();
     *
     * ai.moderation.image({
     * image: "./path-to-your-image.png"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     *
     * ```
     */
    image: imageModeration,
  };

  /**
   * These functions can be used to generate text content using different AI models. The available versions include v2, v3, and alpha.
   * It has access to the following functions:
   * @namespace contentGeneration
   * @property {function} - v2: Version 2 Content Generation AI focused only on Business Content Generation Purpose.
   * @property {function} - v3: Version 3 Advanced Generation AI focused for more creative and understanding capabilities.
   * @property {function} - alpha: Alpha version Content Generation AI with data upto 2023 which can be used to generate Current Data based content.
   * @property {function} - large: The Large Content Models are the Custom Trained Content Models that depend on the User's Training Data. You can provide a pre-trained model to generate content on top of it. This is mostly used for use-cases where you want to run a model based on your pre-trained dataset.
   * Object containing different versions of Content Generation AI.
   */
  contentGeneration = {
    /**
     * Version 2 Content Generation AI focused only on Business Content Generation Purpose. It can be used to generate content for a variety of business use cases where the content is not too creative or complex. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-textgen
     * @param {object} conversation_history: An array of object representing the history of the conversation. Default is undefined.
     * @param {boolean} preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
     * @param {string} question: A string representing the question to generate content for. Default is undefined.
     * @param {string} training_data: A string representing the training data to use for generating content. Default is undefined.
     * @param {number} randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
     * @param {boolean} stream_data: A boolean indicating whether to stream the data. Default is false.
     * @param {string} response_type: A string representing the response type that can be text or JSON, expected from the function. Default is JSON.
     * @link https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-textgen
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
     * let ai = worqhat.ai();
     *
     * ai.contentGeneration.v2({
     * conversation_history: [{ "previous": "Previous conversation history" }, { "current": "Current conversation history" }],
     * preserve_history: true,
     * question: "Your question here",
     * training_data: "your-training-data-id",
     * randomness: 0.3,
     * stream_data: true,
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     * ```
     */
    v2: v2Content,
    /**
     * Version 3 Advanced Generation AI focused for more creative and understanding capabilities. It can be used to generate content for a variety of use cases where the content is more creative or complex. It can run complex situational analysis and understand the context of the commands. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v3-textgen
     * @param {object} conversation_history: An array of object representing the history of the conversation. Default is undefined.
     * @param {boolean} preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
     * @param {string} question: A string representing the question to generate content for. Default is undefined.
     * @param {string} training_data: A string representing the training data to use for generating content. Default is undefined.
     * @param {number} randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
     * @param {boolean} stream_data: A boolean indicating whether to stream the data. Default is false.
     * @param {string} response_type: A string representing the response type that can be text or JSON, expected from the function. Default is JSON.
     * @link https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v3-textgen
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
     * let ai = worqhat.ai();
     *
     * ai.contentGeneration.v3({
     * conversation_history: [{ "previous": "Previous conversation history" }, { "current": "Current conversation history" }],
     * preserve_history: true,
     * question: "Your question here",
     * training_data: "your-training-data-id",
     * randomness: 0.3,
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v3: v3Content,
    /**
     * Alpha version Content Generation AI with data upto 2023 which can be used to generate Current Data based content. The Alpha Channel of AiCon V2 is mostly dependent on the Data upto May 2023 which makes it relatively upto date and more accurate than the previous versions of AiCon. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-2023-alpha
     * @param {string} question: A string representing the question to generate content for. Default is undefined.
     * @param {object} conversation_history: An object representing the history of the conversation. Default is undefined.
     * @param {boolean} preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
     * @param {string} training_data: A string representing the training data to use for generating content. Default is undefined.
     * @param {number} randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
     * @param {boolean} stream_data: A boolean indicating whether to stream the data. Default is false.
     * @param {string} response_type: A string representing the response type that can be text or JSON, expected from the function. Default is JSON.
     * @link https://docs.worqhat.com/api-reference/ai-models/text-generation-ai/aicon-v3-alpha
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
     * let ai = worqhat.ai();
     *
     * ai.contentGeneration.alpha({
     * question: "Your question here",
     * conversation_history: { "previous": "Previous conversation history" },
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    alpha: alphaContent,
    /**
     * Large Content Generation AI Model. This model is designed to generate large amounts of content based on the provided parameters. You can provide a pre-trained model to generate content on top of it. This is mostly used for use-cases where you want to run a model based on your pre-trained dataset. It can be used to generate content for a variety of use cases where the content is more creative or complex.
     *  Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-large-beta
     * @param {string} datasetId: A string representing the ID of the dataset to use for generating content. This is a required parameter.
     * @param {object} conversation_history: An array object representing the history of the conversation. Default is undefined.
     * @param {boolean} preserve_history: A boolean indicating whether to preserve the conversation history. Default is false.
     * @param {string} question: A string representing the question to generate content for. Default is undefined.
     * @param {string} instructions: A string representing the instructions to use for generating content. Default is undefined.
     * @param {number} randomness: A number representing the level of randomness to use for generating content. Default is 0.2.
     * @param {boolean} stream_data: A boolean indicating whether to stream the data. Default is false.
     * @param {string} response_type: A string representing the response type that can be text or JSON, expected from the function. Default is JSON.
     * @link https://docs.worqhat.com/api-reference/ai-models/text-generation-ai/aicon-v3-alpha
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
     * let ai = worqhat.ai();
     *
     * ai.contentGeneration.large({
     * conversation_history: [{ "previous": "Previous conversation history" }, { "current": "Current conversation history" }],
     * datasetId: "your-dataset-id",
     * preserve_history: true,
     * question: "Your question here",
     * instructions: "your-instructions",
     * randomness: 0.3,
     * stream_data: true,
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
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
   *@namespace search
   *@property {function} - v2: Search function for API v2. AI assisted Text Based Search Engine.
   *@property {function} - v3: Search function for API v3. Meaning and Context Based Search experience powered by AI
   */
  search = {
    /**
     * Search function for API v2. AI assisted Text Based Search Engine. Read more at https://docs.worqhat.com/ai-models/ai-for-search/search-v2
     * @param {string} question - The search query string.
     * @param {string} training_data - Contains the Referenced Dataset Id for the pre-trained dataset.
     * @link https://docs.worqhat.com/ai-models/ai-for-search/search-v2
     * @returns {Promise} A Promise that resolves to the search results. By default it returns all the results that match the query.
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
     * let ai = worqhat.ai();
     *
     * ai.search.v2({
     * question: "Your search query here",
     * training_data: "your-training-data-id"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v2: v2Search,
    /**
     * Search function for API v3. Meaning and Context Based Search experience powered by AI. Suitable for use cases where you want to return the most relevant results. Read more at https://docs.worqhat.com/ai-models/ai-for-search/search-v3
     * @param {string} question - The search query string.
     * @param {string} training_data - Contains the Referenced Dataset Id for the pre-trained dataset.
     * @param {number} search_count - Returns the number of parameters we want to return. Default is 3. You can return as many as you want, but the more you return, the longer it will take.
     * @link https://docs.worqhat.com/ai-models/ai-for-search/search-v3
     * @returns {Promise} A Promise that resolves to the search results.
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
     * let ai = worqhat.ai();
     *
     * ai.search.v3({
     * question: "Your search query here",
     * training_data: "your-training-data-id",
     * search_count: 5
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v3: v3Search,
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
   * @property {function} train - Function for training models with datasets.
   */
  datasets = {
    /**
     * Function for deleting trained datasets. It can access the Datasets API to delete a dataset that you have trained for both AI and Search Interfaces. However, you will only be able to delete datasets that you have created or have access to.
     *
     * @param {string} datasetId - The ID of the dataset to be deleted. This is a required parameter.
     * @link https://docs.worqhat.com/api-reference/ai-models/model-training/delete-datasets
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
     * let ai = worqhat.ai();
     *
     * ai.datasets.delete({
     * datasetId: "your-dataset-id"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    delete: deleteTrainedDatasets,
    /**
     * Function for viewing all trained datasets. It can access the Datasets API to retrieve a list of all datasets that you have trained for both AI and Search Interfaces. However, you will only be able to view datasets that you have created or have access to.
     *
     * @function list
     * @link https://docs.worqhat.com/api-reference/ai-models/model-training/view-datasets
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
     * let ai = worqhat.ai();
     *
     * ai.datasets.list()
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    list: viewTrainedDatasets,
    /**
     * Function for training custom models using datasets. It can access the Datasets API to train a dataset that you have to train for both AI and Search Interfaces. However, you will only be able to train models with datasets that you have opted for.
     *
     * @param {string} datasetId - The ID of the Dataset that you want to train. This is optional. If you don't pass a Dataset ID, we will generate a random ID for you. Make sure this is unique. You can pass in a old id if you want to add in more data to your existing Trained Dataset.
     * @param {string} dataset_name - The Name of the Dataset that you want to train.
     * @param {string} dataset_type - The Type of the Training Dataset after Saving. It can be either self or org.
     * @param {string} json_data - The JSON Data that you want to train. You can pass in the JSON Data in the form of a stringified JSON.
     * @param {string | File} training_file - The Training File that you want to train. You can pass in the Training File in the form of a CSV or a PDF file.
     * @link https://docs.worqhat.com/api-reference/ai-models/model-training/train-datasets
     * @returns {Promise} A Promise that resolves to the training result.
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
     * let ai = worqhat.ai();
     *
     * ai.datasets.train({
     * datasetId: "your-dataset-id"
     * dataset_name: "your-dataset-name"
     * dataset_type: "dataset-type"
     * json_data: "training-json-data"
     * training_file: "training-file"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    train: trainCustomDatasets,
  };

  /**
   * The `textExtraction` object contains functions for extracting text from different sources.
   * It has access to the following functions:
   *
   * @namespace textExtraction
   * @property {function} web - Function for extracting text from web pages.
   * @property {function} pdf - Function for extracting text from PDF files.
   * @property {function} image - Function for extracting text from images.
   * @property {function} speech - Function for extracting text from speech.
   */
  textExtraction = {
    /**
     * Function for extracting text from web pages. It sends a request to the Web Extraction AI Model and returns the extracted text. Key components such as headlines, paragraphs, images, and tables are identified, and the algorithm extracts them in a structured format like JSON. Additionally, the extracted data is cleaned and normalized to enhance its usability for analysis and processing purposes. Read more at: https://docs.worqhat.com/ai-models/text-extraction/web-extraction
     * @param {boolean} code_blocks - A boolean indicating whether to extract code blocks. Default is false.
     * @param {boolean} headline - A boolean indicating whether to extract headlines. Default is false.
     * @param {boolean} inline_code - A boolean indicating whether to extract inline code. Default is false.
     * @param {boolean} references - A boolean indicating whether to extract references. Default is false.
     * @param {boolean} tables - Whether to extract the tables in the web page.
     * @param {string} url_path - A string representing the URL of the web page to extract text from. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/text-extraction/web-extraction
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
     * let ai = worqhat.ai();
     *
     * ai.textExtraction.web({
     * code_blocks: true,
     * headline: true,
     * inline_code: true,
     * references: true,
     * url_path: "https://www.your-website.com"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    web: webExtraction,
    /**
     * Function for extracting text from PDF files. It sends a request to the PDF Extraction AI Model and returns the extracted text. Read more at: https://docs.worqhat.com/ai-models/text-extraction/pdf-extraction
     * @param {object} file - An object representing the PDF file to extract text from. It contains the path and name of the file. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/text-extraction/pdf-extraction
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
     * let ai = worqhat.ai();
     *
     * var file = {
     *  path: "./path-to-your-pdf-file.pdf",
     * name: "your-pdf-file-name.pdf"
     * }
     *
     * ai.textExtraction.pdf({
     * file: file
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     *
     * ```
     */
    pdf: PDFExtraction,
    /**
     * Function for extracting text from images. It sends a request to the Image Extraction AI Model and returns the extracted text. Read more about the Models and their use cases at: https://docs.worqhat.com/ai-models/text-extraction/image-extraction
     * @param {object} image - The image to extract text from. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {string} output_type - The type of output to be generated. You can choose between json and text. json will return the text detection results as a JSON object with the scan words marked and positional information. text will return the text detection results as a plain text string.
     * @link https://docs.worqhat.com/ai-models/text-extraction/image-extraction
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
     * let ai = worqhat.ai();
     *
     * var image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.textExtraction.image({
     * image: image,
     * output_format: "json"
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    image: imageExtraction,
    /**
     * Function for extracting text from speech. It sends a request to the Speech Extraction AI Model and returns the extracted text. Read more about the Models and their use cases at: https://docs.worqhat.com/ai-models/speech-extraction
     * @param {object} audio - The audio to extract text from. It can be a `File Path`. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/speech-extraction
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
     * var audio = {
     * path: "./path-to-your-audio-file.mp3",
     * name: "your-audio-file-name.mp3"
     * }
     *
     * ai.textExtraction.speech({
     * audio: audio
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
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
  analyseImages = {
    /**
     * Function for analysing images. It sends a request to the Image Analysis AI Model and returns the analysis results. they can detect a wide range of labels, numbering in the thousands. These labels encompass objects such as “Palm Tree,” scenes like “Beach,” actions such as “Running,” and concepts like “Outdoors”. Also analyze various image properties using computer vision techniques. These properties include foreground and background colors, sharpness, brightness, and contrast. By analyzing these properties, the models gain further insights into the visual characteristics and qualities of the image. Read more at https://docs.worqhat.com/ai-models/image-analysis/image-analysis-v2
     * @param {string | File | string[]| object} image - The image to be analysed. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {string} output_type - The type of output to be generated. You can choose between json and text. json will return the text detection results as a JSON object with the scan words marked and positional information. text will return the text detection results as a plain text string with a proper description of the image and what it contains.
     * @param {string} question - The question to be answered by the AI or any specific command you would like the Model to take into consideration while analysing the image. This is an optional parameter. If not provided, the AI will only send a description of the image and what it contains.
     * @param {string} training_data - The training data to be used for the AI. This is an optional parameter. If not provided, the AI will use the default training data. It is only applicable for Image Analysis process with Text as output_type.
     * @param {boolean} stream_data - Whether to stream the data as it is being generated. If set to true, the response will be streamed as the data is being generated. This is useful when you want to generate a lot of content and want to save the data as it is being generated. You need to handle Server Sent Events for this use case.
     * @link https://docs.worqhat.com/ai-models/image-analysis/image-analysis-v2
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
     * let ai = worqhat.ai();
     *
     * var image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.analyseImages.analyse({
     * image: image,
     * output_type: 'text' | 'json',
     * question: "your-question",
     * training_data: "training_data",
     * stram_data: true | false
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    analyse: analyseImagesProcess,
    /**
     * Function for detecting faces in images. You can detect faces within an image, and obtain valuable information about those faces. This includes the location of detected faces, facial landmarks such as the position of eyes, and attributes such as emotions (e.g., happiness or sadness) and the presence of glasses or face occlusion.. It sends a request to the Face Detection AI Model and returns the detection results. Read more at https://docs.worqhat.com/ai-models/image-analysis/face-analysis
     * @param {object} image - The image to be analysed. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-analysis/face-analysis
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
     * let ai = worqhat.ai();
     *
     * var image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.analyseImages.detectFaces({
     * image: image
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    detectFaces: detectFaces,
    /**
     * Function for Detecting faces in images and comparing them with other faces in a Database or another image. It sends a process request to the Face Comparison AI Model and returns the comparison results. Read more at https://docs.worqhat.com/ai-models/image-analysis/face-comparison-v2
     * @param {object} source_image - The source image to be compared. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {object} target_image - The target image to be compared. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-analysis/face-comparison-v2
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
     * let ai = worqhat.ai()
     *
     * var source_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * var target_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.analyseImages.compareFaces({
     * source_image: source_image,
     * target_image: target_image
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    compareFaces: compareFaces,
  };

  /**
   * The `imageVariations` object contains functions for modifying images using different versions of the API and for upscaling images.
   * It has access to the following functions:
   *@namespace imageVariations
   *@property {function} - v2: Function for modifying images using version 2 of the AI Image Model and it carries the inherent features of the model.
   *@property {function} - v3: Function for modifying images using version 3 of the API and it carries the inherent features of the model.
   *@property {function} - removeText: Function removes all textual content from an image through a single API call, providing a clean and text-free version of the original image.
   *@property {function} - removeBackground: Function removes background from images in a single API call, delivering a clear and focused foreground subject without the original backdrop.
   *@property {function} - replaceBackground: Function replaces an image background with a new one in a single API call, seamlessly integrating the foreground subject with a new backdrop of your choice.
   *@property {function} - searchReplaceImage: Function searches and replaces specific objects within an image with alternative imagery in a single API call. It facilitates creative and dynamic transformations, making it ideal for a variety of applications such as updating product images for e-commerce, altering elements in marketing materials, or personalizing photos.
   *@property {function} - extendImage: Function extends the boundaries of an image by inserting additional content, minimizing artifacts and maintaining the quality of the original image.
  // Search and Replace Objects in Image
  // Extend Image Boundaries
   */
  imageVariations = {
    /**
     * Function for modifying images using version 2 of the API. It sends a request to the Image Modification V2 AI Model and returns the new image. Read more at https://docs.worqhat.com/ai-models/image-generation/image-image-v2
     * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {string} modification - The modifications to be made to the image. This is a required parameter.
     * @param {"url" | "blob"} output_type - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
     * @param {number} similarity - The similarity percentage for the image modification. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-generation/image-image-v2
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
     * let ai = worqhat.ai()
     *
     * var existing_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.imageVariations.v2({
     * existing_image: existing_image,
     * modification: "your modifications",
     * outputType: "url",
     * similarity: 80
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v2: imageModificationV2,
    /**
     * Function for modifying images using version 3 of the API. It sends a request to the Image Modification V3 AI Model and returns the new image. Read more about the Model at https://docs.worqhat.com/ai-models/image-generation/image-image-v3
     * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {string} modification - The modifications to be made to the image. This is a required parameter.
     * @param {"url" | "blob"} output_type - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
     * @param {number} similarity - The similarity percentage for the image modification. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-generation/image-image-v3
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
     * let ai = worqhat.ai()
     *
     * var existing_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.imageVariations.v3({
     * existing_image: existing_image,
     * modification: "your modifications",
     * outputType: "url",
     * similarity: 80
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v3: imageModificationV3,
    /**
     * Function for modifying images using version 2 of the API. It sends a request to the Image Modification V2 AI Model and returns the new image. Read more at https://docs.worqhat.com/ai-models/image-generation/image-image-v2
     * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {string} modification - The modifications to be made to the image. This is a required parameter.
     * @param {"url" | "blob"} output_type - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
     * @param {number} similarity - The similarity percentage for the image modification. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-generation/image-image-v2
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
     * let ai = worqhat.ai()
     *
     * var existing_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.imageVariations.v2({
     * existing_image: existing_image,
     * modification: "your modifications",
     * outputType: "url",
     * similarity: 80
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    removeText: removeTextFromImage,
  };

  /**
   * These functions can be used to generate images using different AI models. The available versions include v2 and v3.
   * It has access to the following functions:
   *@namespace imageGeneration
   *@property {function} - v2: 768px Max Width Image Models Version 2 Image Generation AI focused on generating images based on provided parameters.
   *@property {function} - v3: 1344px Max Width Upscaled Image Models Version 3 Advanced Image Generation AI focused on more creative capabilities and complex realistic images.
   * Object containing different versions of Image Generation AI.
   */
  imageGeneration = {
    /**
     * Version 2 Image Generation AI focused on generating images based on provided parameters. It is the smaller image model with squares of max 512px and rectangles of max 768px on the longest side. It is faster and suitable for most use cases. Read more at https://docs.worqhat.com/ai-models/image-generation/imagecon-v2
     * @param {string} orientation: A string representing the orientation of the image. You can choose between ``Landscape``, ``Portrait`` or ``Square``.  Default is "Square".
     * @param {string} image_style: A string representing the style of the image. Default is "default".
     * @param {string} output_type: A string representing the output type of the image. You can choose between ``url`` or ``blob``. The``url`` parameter returns the Cloud Hosted Link to the Image, ``blob`` returns the Base64 Image. Default is "url".
     * @param {array} prompt: An array of strings representing the prompts for the image generation. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-generation/imagecon-v2
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
     * let ai = worqhat.ai()
     *
     * ai.imageGeneration.v2({
     * orientation: "Landscape",
     * output_type: "url",
     * image_style: "Anime",
     * prompt: ["Your prompt here"]
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     * ```
     */
    v2: v2ImageGen,
    /**
     * Version 3 Advanced Image Generation AI focused on more creative capabilities and complex realistic images. It is the larger image model with squares of max 1024px and rectangles of max 1344px on the longest side. It is slower and suitable for more complex use cases where more details are required. Read more at https://docs.worqhat.com/ai-models/image-generation/imagecon-v3
     * @param {string} orientation: A string representing the orientation of the image. You can choose between ``Landscape``, ``Portrait`` or ``Square``.  Default is "Square".
     * @param {string} image_style: A string representing the style of the image. Default is "default".
     * @param {string} output_type: A string representing the output type of the image. You can choose between ``url`` or ``blob``. The``url`` parameter returns the Cloud Hosted Link to the Image, ``blob`` returns the Base64 Image. Default is "url".
     * @param {array} prompt: An array of strings representing the prompts for the image generation. This is a required parameter.
     * @link https://docs.worqhat.com/ai-models/image-generation/imagecon-v3
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
     * let ai = worqhat.ai()
     *
     * ai.imageGeneration.v3({
     * orientation: "Landscape",
     * output_type: "url",
     * image_style: "Anime",
     * prompt: ["Your prompt here"]
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     * ```
     */
    v3: v3ImageGen,
  };

  /**
   * This function can be used to upscale images using AI model.
   * It has access to the following function:
   *@namespace upscaleImage
   *@property {function} - v2: 768px Max Width Image Models Version 2 Image Upscale AI focused on upscaling images based on provided parameters.
   */
  upscaleImage = {
    /**
     * Function for modifying images using version 3 of the API. It sends a request to the Image Modification V3 AI Model and returns the new image.
     * @param {File | string} existing_image - The existing image to be modified. It can be a `File object` or a `URL` or `base64` encoded image data. This is a required parameter.
     * @param {number} scale - The scale percentage for the image upscaling. This is default to 2.
     * @param {"url" | "blob"} output_type - The output type of the modified image. It can be either "url" or "blob". This is an optional parameter.
     * @link http://localhost:3000/node-js-sdk/ai-models/image-generation/image-upscale
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
     * let ai = worqhat.ai()
     *
     * var existing_image = {
     * path: "./path-to-your-image.png",
     * name: "your-image-name.png"
     * }
     *
     * ai.upscaleImage.v2({
     * existing_image: existing_image,
     * scale: 3
     * })
     * .then((result) => console.log(result))
     * .catch((error) => console.error(error));
     *
     * ```
     */
    v2: imageUpscaler,
  };
}
