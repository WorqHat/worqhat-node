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

export const fetchWithCondition = async (
  name: string,
  whereQuery: { field: string; operator: string; value: any }[],
  joinStatement?: string,
  orderBy?: string,
  order?: 'asc' | 'desc' | null,
  limit?: number | null,
  startAfter?: number | null,
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
      `${baseUrl}/api/collections/data/fetch/query`,
      {
        collection: name,
        queries: whereQuery,
        compounding: joinStatement || '',
        orderType: order || null,
        orderBy: orderBy || null,
        limit: limit || null,
        startAfter: startAfter || null,
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
    debug(
      LogStatus.ERROR,
      `Database Query`,
      `Error retrieving data from collection ${name}`,
    );
    throw handleAxiosError({
      response: 400,
      data: `Error retrieving data from collection ${name}`,
      statusText: `Error retrieving data from collection ${name}. This happens because of an improper query or a invalid parameter passed to the query.`,
    });
  }
};
