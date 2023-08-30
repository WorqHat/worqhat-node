import { VERSION } from "./version";
import * as Success from "./success";
import * as Errors from "./error";
import { appConfiguration } from "./index";

export const baseUrl = "https://api.worqhat.com";

const MAX_RETRIES = 2;

declare const Deno: any;

const createTrackerResponse = () => {
  var response = {
    "X-WorqHat-Lang": "js",
    "X-WorqHat-Package-Version": VERSION,
    "X-WorqHat-Platform": "node",
  };
  return response;
};

export const createLogger = (
  action: string,
  message: string,
  status: string,
  userId: string,
  orgId: string,
) => {
  var platformData = createTrackerResponse();
  var logger = {
    message: message,
    action: action,
    status: status,
    userId: userId,
    orgId: orgId,
    ...platformData,
  };

  storeLogData(logger);
};

const storeLogData = (logData: any) => {
  var url = baseUrl + "/internal/api/v1/logs";
  var headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.WORQHAT_API_KEY,
    "x-server-token": "true",
  };

  var options = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(logData),
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      var message = Success.APISuccess.generate(200, data);
      return message;
    })
    .catch((err) => {
      Errors.APIError.generate(400, { error: "Bad Request" }, "Bad Request");
    });
};

export const safeJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return undefined;
  }
};

// https://stackoverflow.com/a/19709846
const startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
const isAbsoluteURL = (url: string): boolean => {
  return startsWithSchemeRegexp.test(url);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const validatePositiveInteger = (name: string, n: unknown): number => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new Error(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return n;
};

export const castToError = (err: any): Error => {
  if (err instanceof Error) return err;
  return new Error(err);
};

export const ensurePresent = <T>(value: T | null | undefined): T => {
  if (value == null)
    throw new Error(
      `Expected a value to be given but received ${value} instead.`,
    );
  return value;
};

/**
 * Read an environment variable.
 *
 * Will return undefined if the environment variable doesn't exist or cannot be accessed.
 */
export const readEnv = (env: string): string | undefined => {
  if (typeof process !== "undefined") {
    return process.env?.[env] ?? undefined;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env);
  }
  return undefined;
};

export const coerceInteger = (value: unknown): number => {
  if (typeof value === "number") return Math.round(value);
  if (typeof value === "string") return parseInt(value, 10);

  throw new Error(
    `Could not coerce ${value} (type: ${typeof value}) into a number`,
  );
};

export const coerceFloat = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);

  throw new Error(
    `Could not coerce ${value} (type: ${typeof value}) into a number`,
  );
};

export const coerceBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return Boolean(value);
};

export const maybeCoerceInteger = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return coerceInteger(value);
};

export const maybeCoerceFloat = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return coerceFloat(value);
};

export const maybeCoerceBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return coerceBoolean(value);
};

// https://stackoverflow.com/a/34491287
export function isEmptyObj(obj: Object | null | undefined): boolean {
  if (!obj) return true;
  for (const _k in obj) return false;
  return true;
}

// https://eslint.org/docs/latest/rules/no-prototype-builtins
export function hasOwn(obj: Object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export enum LogStatus {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export function debug(status: LogStatus, action: string, ...args: any[]) {
  if (appConfiguration && appConfiguration.debug) {
    const timestamp = new Date().toISOString();
    let statusOutput: string;

    switch (status) {
      case LogStatus.INFO:
        statusOutput = `\x1b[32m${status}\x1b[0m`;
        break;
      case LogStatus.WARN:
        statusOutput = `\x1b[33m${status}\x1b[0m`;
        break;
      case LogStatus.ERROR:
        statusOutput = `\x1b[31m${status}\x1b[0m`;
        break;
      default:
        statusOutput = status;
    }

    console.log(
      `WorqHat:DEBUG:${statusOutput}:${action}:${timestamp}`,
      ...args,
    );
  }
}

let intervalId: NodeJS.Timeout | null = null;

export const startProcessingLog = (modelName: string) => {
  intervalId = setInterval(() => {
    debug(LogStatus.INFO, modelName, `AI Model is processing data`);
  }, 1000);
};

export const stopProcessingLog = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

/**
 * https://stackoverflow.com/a/2117523
 */
const uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" &&
    // @ts-ignore
    typeof window.document !== "undefined" &&
    // @ts-ignore
    typeof navigator !== "undefined"
  );
};

export interface HeadersProtocol {
  get: (header: string) => string | null | undefined;
}
export type HeadersLike =
  | Record<string, string | string[] | undefined>
  | HeadersProtocol;

export const isHeadersProtocol = (headers: any): headers is HeadersProtocol => {
  return typeof headers?.get === "function";
};

export const getHeader = (
  headers: HeadersLike,
  key: string,
): string | null | undefined => {
  const lowerKey = key.toLowerCase();
  if (isHeadersProtocol(headers))
    return headers.get(key) || headers.get(lowerKey);
  const value = headers[key] || headers[lowerKey];
  if (Array.isArray(value)) {
    if (value.length <= 1) return value[0];
    console.warn(
      `Received ${value.length} entries for the ${key} header, using the first entry.`,
    );
    return value[0];
  }
  return value;
};

/**
 * Encodes a string to Base64 format.
 */
export const toBase64 = (str: string | null | undefined): string => {
  if (!str) return "";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }

  if (typeof btoa !== "undefined") {
    return btoa(str);
  }

  throw new Error(
    "Cannot generate b64 string; Expected `Buffer` or `btoa` to be defined",
  );
};
