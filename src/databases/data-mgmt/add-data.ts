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

export const addDataDb = async (
  name: string,
  docId: any,
  data: any,
  retries: number = 0,
): Promise<object> => {
  debug(LogStatus.INFO, `Update Database`, `Adding data to collection ${name}`);
  if (!name) {
    debug(LogStatus.ERROR, 'Update Database', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Update Database', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Update Database`,
      `Adding data to collection ${name}`,
    );
    startProcessingLog(`Update Database`, `Adding data to collection ${name}`);
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
      `Update Database`,
      `Data added to collection ${name}`,
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
        `Update Database`,
        `Error adding data to collection ${name}, retrying (${retries + 1})`,
      );
      return addDataDb(name, docId, data, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Update Database`,
        `Error adding data to collection ${name} after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};
