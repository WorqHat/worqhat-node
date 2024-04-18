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

export const fetchAllData = async (
  name: string,
  outputType: string,
  retries: number = 0,
): Promise<object> => {
  debug(
    LogStatus.INFO,
    `Database Fetch`,
    `Retrieving data from collection ${name}`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Database Fetch', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Database Fetch', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Database Fetch`,
      `Retrieving data from collection ${name}`,
    );
    startProcessingLog(
      `Database Fetch`,
      `Retrieving data from collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/fetch/all`,
      {
        collection: name,
      },
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
          'Content-Type': 'application/json',
        },
        responseType: outputType === 'stream' ? 'stream' : 'json',
      },
    );

    stopProcessingLog();
    debug(
      LogStatus.INFO,
      `Database Fetch`,
      `Retrieving data from collection ${name}`,
    );
    if (outputType === 'stream') {
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
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Database Fetch`,
        `Error retrieving data from collection ${name}, retrying (${
          retries + 1
        })`,
      );
      return fetchAllData(name, outputType, retries + 1);
    } else {
      stopProcessingLog();
      debug(
        LogStatus.ERROR,
        `Database Fetch`,
        `Error retrieving data from collection ${name} after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};
