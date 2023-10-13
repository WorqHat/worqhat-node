import axios from 'axios';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../core';
import { appConfiguration } from '../index';
import { ContentGenerationParams, AlphaParams, LargeParams } from '../types';
import { handleAxiosError } from '../error';

import { Readable } from 'stream';

const generateContent = async (
  version: string,
  history_object: object | undefined,
  preserve_history: boolean | undefined,
  question: string | undefined,
  training_data: string | undefined,
  randomness: number | undefined,
  stream?: boolean,
): Promise<Readable | object> => {
  debug(
    LogStatus.INFO,
    `AiCon${version}`,
    'Processor function called with question:',
    question,
  );
  if (!question) {
    debug(LogStatus.ERROR, `AiCon${version}`, 'Question is missing');
    throw new Error('Question is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, `AiCon${version}`, 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `AiCon${version}`,
    'Processing AI Model for Content Generation',
  );
  startProcessingLog(
    `AiCon${version}`,
    'Processing AI Model for Content Generation',
  );

  try {
    const response = await axios({
      method: 'post',
      url: `${baseUrl}/api/ai/content/${version}`,
      data: {
        history_object: history_object || {},
        preserve_history: preserve_history || false,
        question: question,
        training_data: training_data || '',
        randomness: randomness || 0.2,
        stream_data: stream || false,
      },
      headers: {
        Authorization: 'Bearer ' + appConfiguration.apiKey,
        'Content-Type': 'application/json',
      },
      responseType: stream ? 'stream' : 'json', // set responseType based on stream flag
    });

    debug(
      LogStatus.INFO,
      `AiCon${version}`,
      'Completed Processing from Content Generation AI Model',
    );
    stopProcessingLog();

    if (stream) {
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
    debug(LogStatus.ERROR, `AiCon${version}`, 'Error:', error);
    return handleAxiosError(error);
  }
};

export const v2Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
  stream,
}: ContentGenerationParams) => {
  debug(LogStatus.INFO, 'AiConV2', 'Function called with question:', question);
  return generateContent(
    'v2',
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
    stream,
  );
};

export const v3Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
  stream,
}: ContentGenerationParams) => {
  debug(
    LogStatus.INFO,
    'v2Content',
    'Function called with question:',
    question,
  );
  return generateContent(
    'v3',
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
    stream,
  );
};

export const alphaContent = async ({
  question,
  conversation_history,
}: AlphaParams) => {
  debug(
    LogStatus.INFO,
    'AiConV2 Alpha',
    'Function called with question:',
    question,
  );

  if (!question) {
    debug(LogStatus.ERROR, 'AiConV2 Alpha', 'Question is missing');
    throw new Error('Question is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'AiConV2 Alpha', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }
  startProcessingLog(
    `AiConV2 Alpha`,
    'Processing AI Model for Content Generation',
  );
  try {
    debug(
      LogStatus.INFO,
      'AiConV2 Alpha',
      'Processing AI Model for Content Generation',
    );
    const response = await axios.post(
      `${baseUrl}/api/ai/content/v2/new/alpha`,
      {
        question: question,
        conversation_history: conversation_history || {},
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    debug(
      LogStatus.INFO,
      'AiConV2 Alpha',
      'Completed Processing from Content Generation AI Model',
    );
    stopProcessingLog();
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(LogStatus.ERROR, 'AiConV2 Alpha', 'Error:', error);
    return handleAxiosError(error);
  }
};

export const largeContent = async ({
  datasetId,
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
  stream,
}: LargeParams) => {
  debug(
    LogStatus.INFO,
    'AiConV2 Large',
    'Function called with question & dataset:',
    { question, datasetId },
  );

  if (!question) {
    debug(LogStatus.ERROR, 'AiConV2 Large', 'Question is missing');
    throw new Error('Question is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'AiConV2 Large', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  if (!datasetId) {
    debug(LogStatus.ERROR, 'AiConV2 Large', 'Dataset ID is missing');
    throw new Error('Dataset ID is required');
  }

  if (!question) {
    debug(LogStatus.ERROR, 'AiConV2 Large', 'Question is missing from request');
    throw new Error('Question is required');
  }
  startProcessingLog(
    `AiConV2 Large`,
    'Processing AI Model for Answer Generation',
  );
  try {
    debug(
      LogStatus.INFO,
      'AiConV2 Large',
      'Processing AI Model for Answer Generation',
    );
    const response = await axios.post(
      `${baseUrl}/api/ai/content/v2-large/answering`,
      {
        datasetId: datasetId,
        question: question,
        randomness: randomness || 0.2,
        history_object: history_object || {},
        preserve_history: preserve_history || false,
        training_data: training_data || '',
        stream_data: stream || false,
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    debug(
      LogStatus.INFO,
      'AiConV2 Large',
      'Completed Processing from Answer Generation AI Model',
    );
    stopProcessingLog();
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(LogStatus.ERROR, 'AiConV2 Large', 'Error:', error);
    return handleAxiosError(error);
  }
};
