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

export const updateDataDb = async (name: string, docId: any, data: any) => {
  debug(
    LogStatus.INFO,
    `Update Data to Collection ${name} with docId ${docId}`,
    `Updating data to collection ${name} with docId ${docId}`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Update Data to Collection',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Update Data to Collection',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Update Data to Collection ${name} with docId ${docId}`,
      `Updating data to collection ${name} with docId ${docId}`,
    );
    startProcessingLog(
      `Update Data to Collection ${name} with docId ${docId}`,
      `Updating data to collection ${name} with docId ${docId}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/update`,
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
      `Update Data to Collection ${name} with docId ${docId}`,
      `Data updated to collection ${name} with docId ${docId}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      `Update Data to Collection ${name} with docId ${docId}`,
      `Error updating data to collection ${name} with docId ${docId}`,
    );
    throw handleAxiosError(error);
  }
};
