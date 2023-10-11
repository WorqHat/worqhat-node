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

export const arrayRemoveDb = async (
  name: string,
  docId: string,
  key: string,
  elements: string,
) => {
  debug(
    LogStatus.INFO,
    'Remove Array from Document',
    `Starting Array Remove operation`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Remove Array from Document',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Remove Array from Document',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      'Remove Array from Document',
      `Removing Array from Document ${docId}`,
    );
    startProcessingLog(
      'Remove Array from Document',
      `Removing Array from Document ${docId}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/array/update/remove`,
      {
        collection: name,
        docId: docId,
        field: key,
        arrayRemove: elements,
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
      'Remove Array from Document',
      `Array removed from Document ${docId}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Remove Array from Document',
      `Error removing Array from Document ${docId}`,
    );
    throw handleAxiosError(error);
  }
};
