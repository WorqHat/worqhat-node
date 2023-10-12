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

export const arrayUnionDb = async (
  name: string,
  docId: string,
  key: string,
  elements: string,
) => {
  debug(LogStatus.INFO, 'Document Function', `Starting Array Union operation`);
  if (!name) {
    debug(LogStatus.ERROR, 'Document Function', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Document Function', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      'Document Function',
      `Adding Array to Document ${docId}`,
    );
    startProcessingLog(
      'Document Function',
      `Adding Array to Document ${docId}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/array/update/add`,
      {
        collection: name,
        docId: docId,
        field: key,
        arrayUnion: elements,
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
      `Array added to Document ${docId}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Document Function',
      `Error adding Array to Document ${docId}`,
    );
    throw handleAxiosError(error);
  }
};
