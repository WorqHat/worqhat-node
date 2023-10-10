import { appConfiguration } from '../../index';
import axios from 'axios';
import { handleAxiosError } from '../../error';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from '../../core';

export const addDataDb = async (name: string, docId: any, data: any) => {
  debug(
    LogStatus.INFO,
    `Add Data to Collection ${name}`,
    `Adding data to collection ${name}`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Add Data to Collection',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Add Data to Collection',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Add Data to Collection ${name}`,
      `Adding data to collection ${name}`,
    );
    startProcessingLog(
      `Add Data to Collection ${name}`,
      `Adding data to collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/add`,
      {
        collection: name,
        docId: docId || null,
        data: data || {},
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
      `Add Data to Collection ${name}`,
      `Data added to collection ${name}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      `Add Data to Collection ${name}`,
      `Error adding data to collection ${name}`,
    );
    throw handleAxiosError(error);
  }
};
