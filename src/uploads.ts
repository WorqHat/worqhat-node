import { toBase64 } from './core';
import { debug, LogStatus } from './core';
import axios from 'axios';
import * as fs from 'fs';

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      debug(
        LogStatus.INFO,
        'Reading Base64 Input File',
        `Starting to read file`,
      );
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = () => {
        debug(
          LogStatus.INFO,
          'Reading Base64 Input File',
          `File read successfully`,
        );
        resolve(toBase64(reader.result as string));
        debug(
          LogStatus.INFO,
          'Reading Base64 Input File',
          `File converted to base64`,
        );
      };
      reader.onerror = () => {
        debug(
          LogStatus.ERROR,
          'Reading Base64 Input File',
          `Error reading file`,
        );
        reject(new Error('Error reading file'));
      };
    } catch (error: any) {
      debug(
        LogStatus.ERROR,
        'Reading Base64 Input File',
        `Unexpected error occurred: ${error.message}`,
      );
      reject(new Error(`Unexpected error occurred: ${error.message}`));
    }
  });
};

export const getImageAsBase64 = async (
  image: string | File | string[],
): Promise<string> => {
  try {
    let base64Data: string;
    if (typeof image === 'string') {
      debug(
        LogStatus.INFO,
        'Processing Input File',
        `Processing Input File of type string`,
      );
      if (image.startsWith('http://') || image.startsWith('https://')) {
        debug(
          LogStatus.INFO,
          'Download Image',
          `Downloading image from URL: ${image}`,
        );
        const response = await axios.get(image, {
          responseType: 'arraybuffer',
        });
        base64Data = Buffer.from(response.data, 'binary').toString('base64');
        debug(LogStatus.INFO, 'Convert to Base64', `Converted image to base64`);
      } else if (image.startsWith('data:image')) {
        debug(
          LogStatus.INFO,
          'Extract Base64',
          `Extracting base64 from data URL`,
        );
        base64Data = image.split(',')[1];
      } else {
        debug(
          LogStatus.INFO,
          'Read File',
          `Reading image file from path: ${image}`,
        );
        const fileData = await fs.promises.readFile(image);
        base64Data = fileData.toString('base64');
        debug(LogStatus.INFO, 'Convert to Base64', `Converted file to base64`);
      }
    } else if (image instanceof File) {
      debug(
        LogStatus.INFO,
        'Process File Object',
        `Processing image of type File object`,
      );
      const reader = new FileReader();
      const fileReadPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(image);
      const dataUrl = await fileReadPromise;
      base64Data = dataUrl.split(',')[1];
      debug(
        LogStatus.INFO,
        'Convert to Base64',
        `Converted File object to base64`,
      );
    } else {
      throw new Error('Unsupported image type provided');
    }
    return base64Data;
  } catch (error: any) {
    const errMsg = `Unexpected error occurred: ${error.message}`;
    debug(LogStatus.ERROR, 'Image Processing Error', errMsg);
    throw new Error(errMsg);
  }
};
