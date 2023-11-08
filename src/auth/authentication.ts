import axios from 'axios';
import { handleAxiosError } from '../error';
import * as Success from '../success';
import { createLogger, baseUrl } from '../core';
import { debug, LogStatus } from '../core';

export const authenticate = function (
  api_key: string | undefined,
): Promise<any> {
  if (!api_key) {
    debug(LogStatus.ERROR, 'Authentication', 'API Key is required');
    throw new Error('API Key is required');
  }
  return new Promise((resolve, reject) => {
    debug(
      LogStatus.INFO,
      'Authentication',
      'Sending request to Authentication',
    );
    axios
      .post(
        baseUrl + '/authentication',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + api_key,
          },
        },
      )
      .then((response) => {
        debug(
          LogStatus.INFO,
          'Authentication',
          'Authentication completed successfully',
        );
        resolve({
          code: 200,
          ...response.data,
        });
      })
      .catch((error) => {
        debug(
          LogStatus.ERROR,
          'Authentication',
          'Authentication failed',
          "There is a network error, please check your network and try again, or try checking your API Key if it's correct",
        );
        const errorResponse = handleAxiosError(error);
        reject(errorResponse);
      });
  });
};
