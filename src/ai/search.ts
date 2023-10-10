import axios from 'axios';
import { handleAxiosError } from '../error';
import * as Success from '../success';
import { appConfiguration } from '../index';
import { searchV2Params, searchV3Params } from '../types';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../core';

export const v2Search = async ({ question, training_data }: searchV2Params) => {
  debug(LogStatus.INFO, 'Search V2', 'Starting search v2:', {
    question,
    training_data,
  });
  if (!question) {
    debug(LogStatus.ERROR, 'Search V2', 'Question is required');
    throw new Error('Question is required');
  }

  const timenow = new Date();
  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Search V2', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Search V2', 'Sending request to Search AI Model');
    startProcessingLog('Search V2');
    const response = await axios.post(
      `${baseUrl}/api/ai/search/v2`,
      {
        question: question,
        training_data: training_data || '',
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    delete response.data.time_taken;

    const timeafter = new Date();
    const time = timeafter.getTime() - timenow.getTime();
    stopProcessingLog();
    debug(LogStatus.INFO, 'Search V2', 'Search V2 completed successfully');
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error) {
    debug(LogStatus.ERROR, 'Search V2', 'Search V2 failed', error);
    throw handleAxiosError(error);
  }
};

export const v3Search = async ({
  question,
  training_data,
  search_count,
}: searchV3Params) => {
  debug(LogStatus.INFO, 'Search V3', 'Starting search v3:', {
    question,
    training_data,
    search_count,
  });
  if (!question) {
    debug(LogStatus.ERROR, 'Search V3', 'Question is required');
    throw new Error('Question is required');
  }

  const timenow = new Date();
  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Search V3', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Search V3', 'Sending request to Search AI Model');
    startProcessingLog('Search V3');
    const response = await axios.post(
      `${baseUrl}/api/ai/search/v3`,
      {
        question: question,
        training_data: training_data || '',
        search_count: search_count || 3,
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    delete response.data.time_taken;

    const timeafter = new Date();
    const time = timeafter.getTime() - timenow.getTime();
    stopProcessingLog();
    debug(LogStatus.INFO, 'Search V3', 'Search V3 completed successfully');
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error) {
    throw handleAxiosError(error);
  }
};
