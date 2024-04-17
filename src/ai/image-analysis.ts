import axios from 'axios';
import * as Errors from '../error';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import * as Success from '../success';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../core';
import {
  ImageAnalysisParams,
  DetectFacesParams,
  CompareFacesParams,
} from '../types';
import { getImageAsBase64 } from '../uploads';
import { appConfiguration } from '../index';
import { handleAxiosError } from '../error';

export const analyseImagesProcess = async (
  params: ImageAnalysisParams,
  retries = 0,
): Promise<object> => {
  const {
    image,
    output_type = 'json',
    question,
    training_data,
    stream_data = false,
  } = params;

  function isArray(input: any): input is Array<any> {
    return Array.isArray(input);
  }

  debug(LogStatus.INFO, 'Image Analysis', `Starting image analysis process`);
  if (!image) {
    debug(LogStatus.ERROR, 'Image Analysis', `Image data is missing`);
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Image Analysis', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    'Image Analysis',
    `Received Image data ${image}`,
    typeof image,
  );
  debug(LogStatus.INFO, 'Image Analysis', `Converting image to base64`);
  const form = new FormData();
  // Check if the input is an array of images
  if (isArray(image)) {
    debug(
      LogStatus.INFO,
      'Image Analysis',
      `Processing Image Array`,
      typeof image,
    );
    for (const singleImage of image) {
      let base64Data: string = await getImageAsBase64(singleImage);
      form.append('images', Buffer.from(base64Data, 'base64'), {
        filename: `image.jpg`,
        contentType: 'image/jpeg',
      });
    }
    debug(LogStatus.INFO, 'Image Analysis', `Processing Image Array`, form);
  } else {
    debug(LogStatus.INFO, 'Image Analysis', `Processing single image`);
    let base64Data: string = await getImageAsBase64(image);
    form.append('images', Buffer.from(base64Data, 'base64'), {
      filename: `image.jpg`,
      contentType: 'image/jpeg',
    });
  }

  // identify content type, make filename random if user not explicity specify it
  // this option should change to array

  form.append('output_type', output_type);

  if (question) {
    form.append('question', question);
  }

  if (training_data) {
    form.append('training_data', training_data);
  }

  form.append('stream_data', stream_data.toString());

  try {
    debug(
      LogStatus.INFO,
      'Image Analysis',
      `Processing AI Model for Image Analysis`,
    );
    startProcessingLog('Image Analysis', 'AI Models processing image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/image-analysis`,
      form,

      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
        responseType: stream_data ? 'stream' : 'json',
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      'Image Analysis',
      `Completed response from image analysis API`,
    );

    if (stream_data) {
      // handle stream data
      response.data.pipe(process.stdout);
      return response.data; // return the stream
    } else {
      return {
        code: 200,
        ...response.data,
      };
    }
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Image Analysis',
        `Error occurred during image analysis, retrying (${retries + 1})`,
        error.message,
      );
      return analyseImagesProcess(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Image Analysis',
        `Error occurred during image analysis after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const detectFaces = async (
  params: DetectFacesParams,
  retries = 0,
): Promise<object> => {
  const { image } = params;

  debug(LogStatus.INFO, 'Detect Faces', `Starting detect faces process`);
  if (!image) {
    debug(LogStatus.ERROR, 'Detect Faces', `Image data is missing`);
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Detect Faces', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  debug(LogStatus.INFO, 'Detect Faces', `Received Image data ${image}`);
  debug(LogStatus.INFO, 'Detect Faces', `Converting image to base64`);

  let base64Data: string = await getImageAsBase64(image);

  const form = new FormData();
  // Append the image as a file
  debug(LogStatus.INFO, 'Detect Faces', `AI Models processing image`);
  form.append('image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  try {
    debug(
      LogStatus.INFO,
      'Detect Faces',
      `Processing AI Model for Detect Faces`,
    );
    startProcessingLog('Detect Faces', 'AI Models processing image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/face-detection`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      'Detect Faces',
      `Completed response from detect faces API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Detect Faces',
        `Error occurred during detect faces, retrying (${retries + 1})`,
      );
      return detectFaces(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Detect Faces',
        `Error occurred during detect faces after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const compareFaces = async (
  params: CompareFacesParams,
  retries = 0,
): Promise<object> => {
  const { source_image, target_image } = params;

  debug(LogStatus.INFO, 'Compare Faces', `Starting compare faces process`);

  if (!source_image) {
    debug(LogStatus.ERROR, 'Compare Faces', `Source image data is missing`);
    throw new Error('Source image data is required');
  }

  if (!target_image) {
    debug(LogStatus.ERROR, 'Compare Faces', `Target image data is missing`);
    throw new Error('Target image data is required');
  }
  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Compare Faces', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    'Compare Faces',
    `Received source and target image data`,
  );

  debug(LogStatus.INFO, 'Compare Faces', `Converting source image to base64`);
  let base64Data_source: string = await getImageAsBase64(source_image);

  debug(LogStatus.INFO, 'Compare Faces', `Converting target image to base64`);
  let base64Data_target: string = await getImageAsBase64(target_image);

  const form = new FormData();
  // Append the images as files
  debug(LogStatus.INFO, 'Compare Faces', `AI Models processing source image`);
  form.append('source_image', Buffer.from(base64Data_source, 'base64'), {
    filename: 'source_image.jpg',
    contentType: 'image/jpeg',
  });

  debug(LogStatus.INFO, 'Compare Faces', `AI Models processing target image`);
  form.append('target_image', Buffer.from(base64Data_target, 'base64'), {
    filename: 'target_image.jpg',
    contentType: 'image/jpeg',
  });

  try {
    debug(
      LogStatus.INFO,
      'Compare Faces',
      `Processing AI Model for Compare Faces`,
    );
    startProcessingLog('Compare Faces', 'AI Models processing images');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/facial-comparison`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      'Compare Faces',
      `Completed response from compare faces API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();

    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Compare Faces',
        `Error occurred while comparing faces, retrying (${retries + 1})`,
      );
      return compareFaces(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Compare Faces',
        `Error occurred while comparing faces after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};
