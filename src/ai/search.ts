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

export const v2Search = async (
  { question, training_data }: searchV2Params,
  retries = 0,
): Promise<object> => {
  debug(LogStatus.INFO, 'Search V2', 'Starting search v2:', {
    question,
    training_data,
  });
  if (!question) {
    debug(LogStatus.ERROR, 'Search V2', 'Question is required');
    throw new Error('Question is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Search V2', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Search V2', 'Sending request to Search AI Model');
    startProcessingLog('Search V2', 'AI Models processing text');
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

    stopProcessingLog();
    debug(LogStatus.INFO, 'Search V2', 'Search V2 completed successfully');
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Search V2',
        `Error occurred during search v2, retrying (${retries + 1})`,
      );
      return v2Search({ question, training_data }, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Search V2',
        `Error occurred during search v2 after maximum retries.`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const v3Search = async ({
  question,
  training_data,
  search_count,
  retries = 0,
}: searchV3Params): Promise<object> => {
  debug(LogStatus.INFO, 'Search V3', 'Starting search v3:', {
    question,
    training_data,
    search_count,
  });
  if (!question) {
    debug(LogStatus.ERROR, 'Search V3', 'Question is required');
    throw new Error('Question is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Search V3', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Search V3', 'Sending request to Search AI Model');
    startProcessingLog('Search V3', 'AI Models processing text');
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

    stopProcessingLog();
    debug(LogStatus.INFO, 'Search V3', 'Search V3 completed successfully');
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Search V3',
        `Error occurred during search v3, retrying (${retries + 1})`,
      );
      return v3Search({
        question,
        training_data,
        search_count,
        retries: retries + 1,
      });
    } else {
      throw handleAxiosError(error);
    }
  }
};
