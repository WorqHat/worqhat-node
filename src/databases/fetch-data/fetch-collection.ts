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

export const fetchAllCollections = async (
  retries: number = 0,
): Promise<object> => {
  debug(LogStatus.INFO, `Database Fetch`, `Retrieving collections`);

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Database Fetch', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Database Fetch`,
      `Retrieving collections from`,
      baseUrl,
      `by`,
      appConfiguration.apiKey,
    );
    startProcessingLog(`Database Fetch`, `Retrieving collections`);
    const response = await axios({
      method: 'post',
      url: `${baseUrl}/api/collections/fetch-all`,
      headers: {
        Authorization: 'Bearer ' + appConfiguration.apiKey,
      },
    });

    stopProcessingLog();
    debug(LogStatus.INFO, `Database Fetch`, `Retrieving collections`);
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Database Fetch`,
        `Error retrieving all collections, retrying (${retries + 1})`,
        error.message,
      );
      return fetchAllCollections(retries + 1);
    } else {
      stopProcessingLog();
      debug(
        LogStatus.ERROR,
        `Database Fetch`,
        `Error retrieving all collections after maximum retries`,
      );
      stopProcessingLog();
      throw handleAxiosError(error);
    }
  }
};

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
        outputType: outputType || 'json',
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
        error.message,
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
