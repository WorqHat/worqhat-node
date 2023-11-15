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

export const fetchRowData = async (
  name: string,
  documentId: string,
  retries: number = 0,
) => {
  debug(
    LogStatus.INFO,
    `Database Query`,
    `Retrieving data from collection ${name}`,
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
      `Retrieving data from collection ${name}`,
    );
    startProcessingLog(
      `Database Query`,
      `Retrieving data from collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/fetch/document`,
      {
        collection: name,
        documentId: documentId,
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
      `Retrieving data from collection ${name}`,
    );
    return {
      code: 200,
      ...response.data,
    };
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
      return fetchRowData(name, documentId, retries + 1);
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
