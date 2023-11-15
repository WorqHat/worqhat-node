import { VERSION } from './version';
import os from 'os';

function getOperatingSystem() {
  return os.platform();
}
function getArchitecture() {
  return os.arch();
}

function createRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class APIError extends Error {
  readonly status: number | undefined;
  readonly error: Object | undefined;
  readonly headers: Record<string, string>;

  constructor(
    status: number | undefined,
    error: Object | undefined,
    message: string | undefined,
    headers: Record<string, string> = {},
  ) {
    super(APIError.makeMessage(error, message, headers));
    this.status = status;

    const data = error as Record<string, any>;
    this.error = data;
    this.message = data?.['message'];
    this.headers = headers;
  }

  private static makeMessage(
    error: any,
    message: string | undefined,
    headers: Record<string, string>,
  ) {
    let msg = error?.message
      ? typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error.message)
      : error
      ? JSON.stringify(error)
      : message || 'Unknown error occurred';

    msg += '\nHeaders: ' + JSON.stringify(headers);

    return msg;
  }

  static generate(
    status: number | undefined,
    errorResponse: Object | undefined,
    message: string | undefined,
    headers: Record<string, string> = {},
  ) {
    const error = (errorResponse as Record<string, any>)?.['error'];

    if (status !== undefined && status === 400) {
      return new BadRequestError(status, error, message);
    }

    if (status !== undefined && status === 401) {
      return new AuthenticationError(status, error, message);
    }

    if (status !== undefined && status === 403) {
      return new PermissionDeniedError(status, error, message);
    }

    if (status !== undefined && status === 404) {
      return new NotFoundError(status, error, message);
    }

    if (status !== undefined && status === 409) {
      return new ConflictError(status, error, message);
    }

    if (status !== undefined && status === 422) {
      return new UnprocessableEntityError(status, error, message);
    }

    if (status !== undefined && status === 429) {
      return new RateLimitError(status, error, message);
    }

    if (status !== undefined && status >= 500) {
      return new InternalServerError(status, error, message);
    }

    return new APIError(status, error, message);
  }
}

export class APIUserAbortError extends APIError {
  override readonly status: undefined = undefined;

  constructor({ message }: { message?: string } = {}) {
    super(undefined, undefined, message || 'Request was aborted.');
  }
}

export class APIConnectionError extends APIError {
  override readonly status: undefined = undefined;

  constructor({
    message,
    cause,
  }: {
    message?: string;
    cause?: Error | undefined;
  }) {
    super(undefined, undefined, message || 'Connection error.');
    // in some environments the 'cause' property is already declared
    // @ts-ignore
    if (cause) this.cause = cause;
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor() {
    super({ message: 'Request timed out.' });
  }
}

export class BadRequestError extends APIError {
  override readonly status: 400 = 400;
}

export class AuthenticationError extends APIError {
  override readonly status: 401 = 401;
}

export class PermissionDeniedError extends APIError {
  override readonly status: 403 = 403;
}

export class NotFoundError extends APIError {
  override readonly status: 404 = 404;
}

export class ConflictError extends APIError {
  override readonly status: 409 = 409;
}

export class UnprocessableEntityError extends APIError {
  override readonly status: 422 = 422;
}

export class RateLimitError extends APIError {
  override readonly status: 429 = 429;
}

export class InternalServerError extends APIError {}

export function handleAxiosError(error: any) {
  if (error.response) {
    const { status, data, statusText } = error.response;
    const errorDetails = {
      status,
      data,
      statusText,
      headers: {
        'X-WorqHat-Lang': 'js',
        'X-WorqHat-Package-Version': VERSION,
        'X-WorqHat-OS': getOperatingSystem(),
        'X-WorqHat-Arch': getArchitecture(),
        'X-WorqHat-Request-Id': createRequestId(),
        'X-WorqHat-Timestamp': new Date().toISOString(),
        'X-WorqHat-Runtime': process.release.name,
        'X-WorqHat-Runtime-Version': process.version,
      },
    };

    return {
      error: errorDetails,
    };
  } else {
    return {
      error: {
        message: `Network Error. This might happen because of Network Connectivity, Socket Connectivity Mismatch or Unable to connect with the Cloud Servers.`,
        headers: {
          'X-WorqHat-Lang': 'js',
          'X-WorqHat-Package-Version': VERSION,
          'X-WorqHat-OS': getOperatingSystem(),
          'X-WorqHat-Arch': getArchitecture(),
          'X-WorqHat-Request-Id': createRequestId(),
          'X-WorqHat-Timestamp': new Date().toISOString(),
          'X-WorqHat-Runtime': process.release.name,
          'X-WorqHat-Runtime-Version': process.version,
        },
      },
    };
  }
}
