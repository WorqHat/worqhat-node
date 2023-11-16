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
  retries: number = 0,
): Promise<object> => {
  debug(
    LogStatus.INFO,
    'Document Function',
    `Starting Increment Field operation`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Document Function', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Document Function', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  elements = Number(elements);

  try {
    debug(
      LogStatus.INFO,
      'Document Function',
      `Incrementing Field in Document ${docId}`,
    );
    startProcessingLog(
      'Document Function',
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
      'Document Function',
      `Field incremented in Document ${docId}`,
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
        'Document Function',
        `Error while incrementing field in Document ${docId}, retrying (${
          retries + 1
        })`,
      );
      return incrementFieldDb(name, docId, key, elements, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Document Function',
        `Error while incrementing field in Document ${docId} after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};
