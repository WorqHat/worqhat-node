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

export const fetchUniqueData = async (
  name: string,
  column: string,
  orderBy?: string,
  order?: 'asc' | 'desc' | '',
) => {
  debug(
    LogStatus.INFO,
    `Retrieve Data from Collection ${name}`,
    `Retrieving data from collection ${name}`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Retrieve Data from Collection',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Retrieve Data from Collection',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Retrieve Data from Collection ${name}`,
      `Retrieving data from collection ${name}`,
    );
    startProcessingLog(
      `Retrieve Data from Collection ${name}`,
      `Retrieving data from collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/fetch/unique`,
      {
        collection: name,
        key: column,
        orderBy: orderBy || '',
        orderType: order || 'asc',
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
      `Retrieve Data from Collection ${name}`,
      `Retrieving data from collection ${name}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      `Retrieve Data from Collection ${name}`,
      `Error retrieving data from collection ${name}`,
    );
    throw handleAxiosError(error);
  }
};
