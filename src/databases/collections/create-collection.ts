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

export const createCollectionWithSchema = async (
  name: string,
  schema: any,
  sortBy: string,
) => {
  debug(
    LogStatus.INFO,
    'Create Collection',
    `Starting Database Collection creation process with schema`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Create Collection', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Create Collection', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(
      LogStatus.INFO,
      'Create Collection',
      `Creating Database Collection with schema`,
    );
    startProcessingLog(
      'Create Collection',
      'Creating Database Collection with schema',
    );
    const response = await axios.post(
      `${baseUrl}/api/collections/create`,
      {
        collection: name,
        collectionSchema: schema || {},
        sortBy: sortBy || null,
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
      'Create Collection',
      `Completed Database Collection creation with schema`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Create Collection',
      `Error occurred during Database Collection creation with schema`,
    );
    throw handleAxiosError(error);
  }
};

export const createCollectionWithoutSchema = async (name: string) => {
  debug(
    LogStatus.INFO,
    'Create Collection',
    `Starting Database Collection creation process`,
  );
  if (!name) {
    debug(LogStatus.ERROR, 'Create Collection', `Collection Name is missing`);
    throw new Error('Collection Name is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Create Collection', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  try {
    debug(LogStatus.INFO, 'Create Collection', `Creating Database Collection`);
    startProcessingLog('Create Collection', 'Creating Database Collection');
    const response = await axios.post(
      `${baseUrl}/api/collections/create`,
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
      'Create Collection',
      `Completed Database Collection creation`,
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    debug(
      LogStatus.ERROR,
      'Create Collection',
      `Error occurred during Database Collection creation`,
    );
    throw handleAxiosError(error);
  }
};
