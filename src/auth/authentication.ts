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
  var timenow = new Date();
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
        var timeafter = new Date();
        var time = timeafter.getTime() - timenow.getTime();
        debug(
          LogStatus.INFO,
          'Authentication',
          'Authentication completed successfully',
        );
        resolve({
          code: 200,
          processingTime: time,
          ...response.data,
        });
      })
      .catch((error) => {
        debug(
          LogStatus.ERROR,
          'Authentication',
          'Authentication failed',
          error,
        );
        const errorResponse = handleAxiosError(error);
        reject(errorResponse);
      });
  });
};
