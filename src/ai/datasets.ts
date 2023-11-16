import axios from 'axios';
import { createLogger, baseUrl, debug, LogStatus } from '../core';
import { appConfiguration } from '../index';
import { deleteDatasetParam } from '../types';
import { handleAxiosError } from '../error';

export const viewTrainedDatasets = async ({
  retries = 0,
}: { retries?: number } = {}): Promise<object> => {
  debug(LogStatus.INFO, 'View Datasets', 'Starting Dataset View Process');
  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'View Datasets', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }
  try {
    debug(LogStatus.INFO, 'View Datasets', 'Sending request to View Datasets');
    const response = await axios.get(`${baseUrl}/api/list-datasets`, {
      headers: {
        Authorization: 'Bearer ' + appConfiguration.apiKey,
      },
    });
    debug(
      LogStatus.INFO,
      'View Datasets',
      'Dataset View Process completed successfully',
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'View Datasets',
        `Dataset View Process failed, retrying (${retries + 1})`,
      );
      return viewTrainedDatasets({ retries: retries + 1 });
    } else {
      debug(
        LogStatus.ERROR,
        'View Datasets',
        "Dataset View Process failed after maximum retries. There is a network error, please check your network and try again, or try checking your API Key if it's correct",
      );
      throw handleAxiosError(error);
    }
  }
};

export const deleteTrainedDatasets = async ({
  datasetId,
  retries = 0,
}: deleteDatasetParam): Promise<object> => {
  debug(LogStatus.INFO, 'Delete Datasets', 'Starting Dataset Deletion Process');
  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Delete Datasets', 'App Configuration is null');
    throw new Error('App Configuration is null');
  }

  if (!datasetId) {
    debug(LogStatus.ERROR, 'Delete Datasets', 'Dataset ID is required');
    throw new Error('Dataset ID is required');
  }

  debug(
    LogStatus.INFO,
    'Delete Datasets',
    'Deleting dataset with ID:',
    datasetId,
  );

  try {
    const response = await axios.delete(
      `${baseUrl}/api/delete-datasets/${datasetId}`,
      {
        headers: {
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    debug(LogStatus.INFO, 'Delete Datasets', 'Dataset deleted successfully');
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Delete Datasets',
        `Dataset deletion failed, retrying (${retries + 1})`,
      );
      return deleteTrainedDatasets({
        datasetId,
        retries: retries + 1,
      });
    } else {
      debug(
        LogStatus.ERROR,
        'Delete Datasets',
        "Dataset deletion failed after maximum retries. There is a network error, please check your network and try again, or try checking your API Key if it's correct",
      );
      throw handleAxiosError(error);
    }
  }
};
