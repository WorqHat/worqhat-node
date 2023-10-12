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

export const incrementFieldDb = async (
  name: string,
  docId: string,
  key: string,
  elements: number,
) => {
  debug(
    LogStatus.INFO,
    'Increment Field in Document',
    `Starting Increment Field operation`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Increment Field in Document',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Increment Field in Document',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  elements = Number(elements);

  try {
    debug(
      LogStatus.INFO,
      'Increment Field in Document',
      `Incrementing Field in Document ${docId}`,
    );
    startProcessingLog(
      'Increment Field in Document',
      `Incrementing Field in Document ${docId}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/increment`,
      {
        collection: name,
        docId: docId,
        field: key,
        increment: elements,
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
      'Increment Field in Document',
      `Field incremented in Document ${docId}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Increment Field in Document',
      `Error while incrementing field in Document ${docId}`,
    );
    throw handleAxiosError(error);
  }
};
