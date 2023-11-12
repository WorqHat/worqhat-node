import axios from 'axios';
import * as Errors from '../error';
import FormData from 'form-data';
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

export const analyseImagesProcess = async (params: ImageAnalysisParams) => {
  const { image } = params;

  debug(LogStatus.INFO, 'Image Analysis', `Starting image analysis process`);
  if (!image) {
    debug(LogStatus.ERROR, 'Image Analysis', `Image data is missing`);
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Image Analysis', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  debug(LogStatus.INFO, 'Image Analysis', `Received Image data ${image}`);
  debug(LogStatus.INFO, 'Image Analysis', `Converting image to base64`);

  let base64Data: string = await getImageAsBase64(image);

  const form = new FormData();
  // Append the image as a file
  debug(LogStatus.INFO, 'Image Analysis', `AI Models processing image`);
  form.append('image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

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
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      'Image Analysis',
      `Completed response from image analysis API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Image Analysis',
      `Error occurred during image analysis: ${error}`,
    );
    throw handleAxiosError(error);
  }
};

export const detectFaces = async (params: DetectFacesParams) => {
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
    debug(
      LogStatus.ERROR,
      'Detect Faces',
      `Error occurred during detect faces: ${error}`,
    );
    throw handleAxiosError(error);
  }
};

export const compareFaces = async (params: CompareFacesParams) => {
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
    debug(
      LogStatus.ERROR,
      'Compare Faces',
      `Error occurred while comparing faces`,
    );
    throw handleAxiosError(error);
  }
};
