import axios from 'axios';
import * as Errors from '../error';
import * as Success from '../success';
import { appConfiguration } from '../index';
import { ImageGenV2Params, ImageGenV3Params } from '../types';
import { handleAxiosError } from '../error';

import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../core';

const generateImage = async (
  version: string,
  orientation: string,
  image_style: string,
  output_type: string,
  prompt: any[],
  retries: number = 0,
) => {
  debug(
    LogStatus.INFO,
    `Image Generation ${version}`,
    'Starting image generation',
    prompt,
  );
  if (prompt.length === 0) {
    debug(LogStatus.ERROR, `Image Generation ${version}`, 'Prompt is required');
    throw new Error('Prompt is required');
  }

  let height = 512;
  let width = 512;

  orientation = orientation.toLowerCase();

  if (orientation === 'square') {
    debug(
      LogStatus.INFO,
      `Image Generation ${version}`,
      'Setting orientation to square',
    );
    height = 512;
    width = 512;
  } else if (orientation === 'landscape') {
    debug(
      LogStatus.INFO,
      `Image Generation ${version}`,
      'Setting orientation to landscape',
    );
    height = 512;
    width = 768;
  } else if (orientation === 'portrait') {
    debug(
      LogStatus.INFO,
      `Image Generation ${version}`,
      'Setting orientation to portrait',
    );
    height = 768;
    width = 512;
  } else {
    debug(
      LogStatus.ERROR,
      `Image Generation ${version}`,
      'Orientation is invalid',
    );
    throw new Error('Orientation is invalid');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Generation ${version}`,
      'App Configuration is null',
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Image Generation ${version}`,
      'Start Processing Image Generation Request',
    );
    startProcessingLog(`Image Generation ${version}`, 'Processing Image');
    const response = await axios.post(
      `${baseUrl}/api/ai/images/generate/${version}`,
      {
        height: height || 512,
        image_style: image_style || 'Default',
        output_type: output_type || 'url',
        prompt: prompt.length > 0 ? prompt : ['This is the prompt'],
        width: width || 512,
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
      `Image Generation ${version}`,
      'Image Generation process completed successfully',
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Generation ${version}`,
        `Error occurred during image generation, retrying (${retries + 1})`,
      );
      return generateImage(
        version,
        orientation,
        image_style,
        output_type,
        prompt,
        retries + 1,
      );
    } else {
      stopProcessingLog();
      debug(
        LogStatus.ERROR,
        `Image Generation ${version}`,
        `Error occurred during image generation after maximum retries: ${error}`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const v2ImageGen = ({
  orientation,
  image_style,
  output_type,
  prompt,
}: ImageGenV2Params) => {
  debug(
    LogStatus.INFO,
    'Image Generation V2',
    'Starting Image Generation V2:',
    prompt,
  );
  return generateImage(
    'v2',
    orientation || 'Square',
    image_style || 'default',
    output_type || 'url',
    prompt,
  );
};

export const v3ImageGen = ({
  orientation,
  image_style,
  output_type,
  prompt,
}: ImageGenV3Params) => {
  debug(
    LogStatus.INFO,
    'Image Generation V3',
    'Starting Image Generation V3:',
    prompt,
  );
  return generateImage(
    'v3',
    orientation || 'Square',
    image_style || 'default',
    output_type || 'url',
    prompt,
  );
};
