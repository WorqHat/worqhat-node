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

// Create two functions. 1. to create a collection with schema and the other to create a collection without schema.

// Create a function to create a collection with schema.

export const createCollectionWithSchema = async (name: string, schema: any) => {
  return {
    code: 200,
    message: 'Collection schemas created successfully',
    data: {
      name,
      schema,
    },
  };
};

// Create a function to create a collection without schema.

export const createCollectionWithoutSchema = async (name: string) => {
  return {
    code: 200,
    message: 'Collection without schema created successfully',
    data: {
      name,
    },
  };
};
