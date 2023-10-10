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

export const deleteDataDb = async (name: string, docId: any) => {
  debug(
    LogStatus.INFO,
    `Delete Document ${docId} from Collection ${name}`,
    `Deleting document ${docId} from collection ${name}`,
  );
  if (!name) {
    debug(
      LogStatus.ERROR,
      'Delete Document from Collection',
      `Collection Name is missing`,
    );
    throw new Error('Collection Name is required');
  }
  if (!docId) {
    debug(
      LogStatus.ERROR,
      'Delete Document from Collection',
      `Document ID is missing`,
    );
    throw new Error('Document ID is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      'Delete Document from Collection',
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      `Delete Document ${docId} from Collection ${name}`,
      `Deleting document ${docId} from collection ${name}`,
    );
    startProcessingLog(
      `Delete Document ${docId} from Collection ${name}`,
      `Deleting document ${docId} from collection ${name}`,
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/data/delete`,
      {
        collection: name,
        docId: docId || null,
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
      `Delete Document ${docId} from Collection ${name}`,
      `Document ${docId} deleted from collection ${name}`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      `Delete Document ${docId} from Collection ${name}`,
      `Error deleting document ${docId} from collection ${name}`,
    );
    throw handleAxiosError(error);
  }
};
