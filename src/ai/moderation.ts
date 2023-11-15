import axios from 'axios';
import { handleAxiosError } from '../error';
import * as Success from '../success';
import FormData from 'form-data';
import { appConfiguration } from '../index';
import { ContentModerationParams, ImageModerationParams } from '../types';
import { getImageAsBase64 } from '../uploads';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../core';

export const contentModeration = async ({
  text_content,
  retries = 0,
}: ContentModerationParams) => {
  debug(
    LogStatus.INFO,
    'Content Moderation',
    `Starting content moderation process`,
  );
  if (!text_content) {
    debug(LogStatus.ERROR, 'Content Moderation', `Text content is missing`);
    throw new Error('Text Content is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Content Moderation', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      'Content Moderation',
      `Processing AI Model for Content Moderation`,
    );
    startProcessingLog('Content Moderation', 'AI Models processing text');
    const response = await axios.post(
      `${baseUrl}/api/ai/moderation`,
      {
        text_content: text_content || '',
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    stopProcessingLog();
    debug(
      LogStatus.INFO,
      'Content Moderation',
      `Completed Processing from Content Moderation AI Model`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Content Moderation',
        `Error occurred during content moderation, retrying (${retries + 1})`,
      );
      return contentModeration({ text_content, retries: retries + 1 });
    } else {
      stopProcessingLog();
      debug(
        LogStatus.ERROR,
        'Content Moderation',
        `Error occurred during content moderation after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const imageModeration = async (
  { image }: ImageModerationParams,
  retries = 0,
) => {
  debug(
    LogStatus.INFO,
    'Image Moderation',
    `Starting image moderation process`,
  );
  if (!image) {
    debug(LogStatus.ERROR, 'Image Moderation', `Image data is missing`);
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Image Moderation', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }
  debug(LogStatus.INFO, 'Image Moderation', `Received Image data ${image}`);
  debug(LogStatus.INFO, 'Image Moderation', `Converting image to base64`);
  let base64Data: string = await getImageAsBase64(image);

  const form = new FormData();
  // Append the image as a file
  debug(LogStatus.INFO, 'Image Moderation', `AI Models processing image`);
  form.append('image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  try {
    debug(
      LogStatus.INFO,
      'Image Moderation',
      `Processing AI Model for Image Moderation`,
    );
    startProcessingLog('Image Moderation', 'AI Models processing image');
    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/image-moderation`,
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
      'Image Moderation',
      `Completed response from Image Moderation AI Model`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Image Moderation',
        `Error occurred during image moderation, retrying (${retries + 1})`,
      );
      return imageModeration({ image }, retries + 1);
    } else {
      stopProcessingLog();
      debug(
        LogStatus.ERROR,
        'Image Moderation',
        `Error occurred during image moderation after maximum retries: ${error}`,
      );
      throw handleAxiosError(error);
    }
  }
};
