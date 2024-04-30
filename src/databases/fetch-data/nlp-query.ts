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

export const fetchNlpQuery = async (
  name: string,
  query: string,
  outputType: string,
  retries: number = 0,
): Promise<object> => {
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
        outputType: outputType,
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
      `Database Query`,
      `Running Language Query on collection ${name}`,
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
    stopProcessingLog();

    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Database Query`,
        `Error retrieving data from collection ${name}, retrying (${
          retries + 1
        })`,
      );
      return fetchNlpQuery(name, query, outputType, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Database Query`,
        `Error retrieving data from collection ${name} after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};
