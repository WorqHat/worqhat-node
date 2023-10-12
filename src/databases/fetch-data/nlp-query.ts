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

export const fetchNlpQuery = async (name: string, query: string) => {
  debug(
    LogStatus.INFO,
    `Database Query`,
    `Running Language Query on collection ${name}`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Database Query', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Database Query', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Database Query`,
      `Running Language Query on collection ${name}`,
    );
    startProcessingLog(
      `Database Query`,
      `Running Language Query on collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/fetch/natural-query`,
      {
        collection: name,
        query: query,
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
      `Database Query`,
      `Running Language Query on collection ${name}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      `Database Query`,
      `Error retrieving data from collection ${name}`,
    );
    throw handleAxiosError(error);
  }
};
