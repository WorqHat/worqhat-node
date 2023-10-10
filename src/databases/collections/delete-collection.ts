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
  return {
    code: 200,
    message: 'Collection schemas deleted successfully',
    data: {
      name,
    },
  };
};
