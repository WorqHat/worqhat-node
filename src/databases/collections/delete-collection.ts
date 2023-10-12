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

export const deleteCollection = async (name: string) => {
  debug(
    LogStatus.INFO,
    'Delete Collection',
    `Starting Database Collection deletion process`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Delete Collection', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Delete Collection', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Delete Collection', `Deleting Database Collection`);
    startProcessingLog('Delete Collection', 'Deleting Database Collection');
    const response = await axios.post(
      `${baseUrl}/api/collections/secure-end/delete`,
      {
        collection: name,
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
      'Delete Collection',
      `Database Collection deleted successfully`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Delete Collection',
      `Error deleting Database Collection`,
    );
    throw handleAxiosError(error);
  }
};
