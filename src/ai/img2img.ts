import axios from 'axios';
import * as Errors from '../error';
import FormData from 'form-data';
import * as Success from '../success';
import sharp from 'sharp';
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
  MAX_PIXEL_COUNT,
  MIN_UPSCALED_DIMENSION,
} from '../core';
import {
  ImageModificationParams,
  ImageUpscaleParams,
  RemoveImageObjParams,
  ReplaceImageBgParams,
  searchObjReplaceImageParams,
  extendBoundariesParams,
  SketchImageParams,
} from '../types';
import { getImageAsBase64 } from '../uploads';
import { appConfiguration } from '../index';
import { handleAxiosError } from '../error';
import { version } from 'chai';

const processImage = async (
  params: ImageModificationParams,
  version: string,
  validateDimensions: (metadata: any) => void,
  retries: number = 0,
): Promise<object> => {
  const { existing_image, modification, output_type, similarity } = params;

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });
  form.append('modifications', modification);
  form.append('output_type', output_type || 'url');
  form.append('similarity', similarity.toString());

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
      modification,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
      modification,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
      );
      return processImage(params, version, validateDimensions, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const imageModificationV2 = async (params: ImageModificationParams) => {
  return processImage(params, 'v2', (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Width metadata is missing from the image.`,
      );
      throw new Error('Width metadata is missing from the image.');
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Height metadata is missing from the image.`,
      );
      throw new Error('Height metadata is missing from the image.');
    }

    if (metadata.width < 128 || metadata.width > 896) {
      debug(
        LogStatus.ERROR,
        'Image Modification V2',
        `Invalid image width. Width should be at least 128 and maximum supported width is 896.`,
      );
      throw new Error(
        'Invalid image width. Width should be at least 128 and maximum supported width is 896.',
      );
    }

    if (metadata.height < 128 || metadata.height > 512) {
      debug(
        LogStatus.ERROR,
        'Image Modification V2',
        `Invalid image height. Height should be at least 128 and maximum supported height is 512.`,
      );
      throw new Error(
        'Invalid image height. Height should be at least 128 and maximum supported height is 512.',
      );
    }

    if (metadata.width > 512 && metadata.height > 512) {
      debug(
        LogStatus.ERROR,
        'Image Modification V2',
        `Invalid image dimensions. Only one of width or height can be above 512.`,
      );
      throw new Error(
        'Invalid image dimensions. Only one of width or height can be above 512.',
      );
    }
  });
};

export const imageModificationV3 = async (params: ImageModificationParams) => {
  return processImage(params, 'v3', (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Width metadata is missing from the image.`,
      );
      throw new Error('Width metadata is missing from the image.');
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Height metadata is missing from the image.`,
      );
      throw new Error('Height metadata is missing from the image.');
    }

    const validDimensions = [
      { width: 1024, height: 1024 },
      { width: 1152, height: 896 },
      { width: 1216, height: 832 },
      { width: 1344, height: 768 },
      { width: 1536, height: 640 },
    ];

    if (
      !validDimensions.some(
        (dim) =>
          (dim.width === metadata.width && dim.height === metadata.height) ||
          (dim.height === metadata.width && dim.width === metadata.height),
      )
    ) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Invalid image dimensions. The dimensions of the image should be one of the following: 1024x1024, 1152x896, 1216x832, 1344x768, or 1536x640.`,
      );
      throw new Error(
        'Invalid image dimensions. The dimensions of the image should be one of the following: 1024x1024, 1152x896, 1216x832, 1344x768, or 1536x640.',
      );
    }
  });
};

export const imageUpscaler = async (
  params: ImageUpscaleParams,
  retries = 0,
): Promise<object> => {
  const { existing_image } = params;

  debug(LogStatus.INFO, 'Image Upscale', `Starting image upscale process`);
  if (!existing_image) {
    debug(LogStatus.ERROR, 'Image Upscale', `Image data is missing`);
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(LogStatus.ERROR, 'Image Upscale', `App Configuration is null`);
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    'Image Upscale',
    `Received Image data ${existing_image}`,
  );
  debug(LogStatus.INFO, 'Image Upscale', `Converting image to base64`);

  let base64Data: string = await getImageAsBase64(existing_image);

  let scale = params.scale || 2;

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    debug(
      LogStatus.ERROR,
      'Image Upscale',
      `Image metadata is missing width or height.`,
    );
    throw new Error('Image metadata is missing width or height.');
  }

  if (metadata.width * scale * (metadata.height * scale) > MAX_PIXEL_COUNT) {
    debug(
      LogStatus.ERROR,
      'Image Upscale',
      `Upscaled image will exceed the maximum pixel count of ${MAX_PIXEL_COUNT}.`,
    );
    throw new Error(
      `Upscaled image will exceed the maximum pixel count of ${MAX_PIXEL_COUNT}.`,
    );
  }

  if (
    metadata.width * scale <= MIN_UPSCALED_DIMENSION &&
    metadata.height * scale <= MIN_UPSCALED_DIMENSION
  ) {
    debug(
      LogStatus.ERROR,
      'Image Upscale',
      `Upscaled height or width should be greater than ${MIN_UPSCALED_DIMENSION}.`,
    );
    throw new Error(
      `Upscaled height or width should be greater than ${MIN_UPSCALED_DIMENSION}.`,
    );
  }

  const form = new FormData();
  // Append the image as a file
  debug(LogStatus.INFO, 'Image Upscale', `AI Models processing image`);
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });
  form.append('output_type', params.output_type || 'url');
  form.append('scale', scale);

  try {
    debug(
      LogStatus.INFO,
      'Image Upscale',
      `Processing AI Model for Image Upscale`,
    );
    startProcessingLog('Image Upscale', 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/upscale/v3`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      'Image Upscale',
      `Completed response from Image Upscale AI Model`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        'Image Upscale',
        `Error occurred during image upscale, retrying (${retries + 1})`,
      );
      return imageUpscaler(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        'Image Upscale',
        `Error occurred during image upscale after maximum retries.`,
      );
      throw handleAxiosError(error);
    }
  }
};

const removeImageParts = async (
  params: RemoveImageObjParams,
  version: string,
  validateDimensions: (metadata: any) => void,
  retries: number = 0,
): Promise<object> => {
  const { existing_image, output_type } = params;

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  form.append('output_type', output_type || 'url');

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/v3/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
      );
      return removeImageParts(params, version, validateDimensions, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const removeTextFromImage = async (params: RemoveImageObjParams) => {
  return removeImageParts(params, 'remove-text', (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Width metadata is missing from the image.`,
      );
      throw new Error('Width metadata is missing from the image.');
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Height metadata is missing from the image.`,
      );
      throw new Error('Height metadata is missing from the image.');
    }
  });
};
export const removeBackgroundFromImage = async (
  params: RemoveImageObjParams,
) => {
  return removeImageParts(params, 'remove-background', (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Width metadata is missing from the image.`,
      );
      throw new Error('Width metadata is missing from the image.');
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Height metadata is missing from the image.`,
      );
      throw new Error('Height metadata is missing from the image.');
    }
  });
};

export const sketchToImageV3 = async (
  params: SketchImageParams,
  retries: number = 0,
): Promise<object> => {
  const { existing_image, output_type, description } = params;
  const version = 'sketch-image';
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  // validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  form.append('output_type', output_type || 'url');
  form.append('description', description);

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/v3/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
        error.message,
      );
      return sketchToImageV3(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const replaceImageBackground = async (
  params: ReplaceImageBgParams,
  retries: number = 0,
): Promise<object> => {
  const { existing_image, output_type, modification } = params;
  const version = 'replace-background';
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  // validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  form.append('output_type', output_type || 'url');
  form.append('modification', modification);

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/v3/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
        error.message,
      );
      return replaceImageBackground(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const searchObjReplaceImage = async (
  params: searchObjReplaceImageParams,
  retries: number = 0,
): Promise<object> => {
  const { existing_image, output_type, modification, search_object } = params;
  const version = 'search-replace-image';
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  // validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  form.append('output_type', output_type || 'url');
  form.append('modification', modification);
  form.append('search_object', search_object);

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/v3/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
        error.message,
      );
      return searchObjReplaceImage(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const extendImageBoundaries = async (
  params: extendBoundariesParams,
  retries: number = 0,
): Promise<object> => {
  const {
    existing_image,
    output_type,
    leftExtend,
    rightExtend,
    topExtend,
    bottomExtend,
    description,
  } = params;
  const version = 'extend-image';
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Starting image modification process`,
  );
  if (!existing_image) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Image data is missing`,
    );
    throw new Error('Image data is required');
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error('App Configuration is null');
  }

  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Received Image data ${existing_image}`,
  );
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `Converting image to base64`,
  );

  let base64Data: string = await getImageAsBase64(existing_image);

  let imageBuffer = Buffer.from(base64Data, 'base64');

  // Get the dimensions of the image
  const metadata = await sharp(imageBuffer).metadata();
  // validateDimensions(metadata);

  const form = new FormData();
  // Append the image as a file
  debug(
    LogStatus.INFO,
    `Image Modification ${version}`,
    `AI Models processing image`,
  );
  form.append('existing_image', Buffer.from(base64Data, 'base64'), {
    filename: 'image.jpg',
    contentType: 'image/jpeg',
  });

  form.append('output_type', output_type || 'url');
  form.append('leftExtend', leftExtend);
  form.append('rightExtend', rightExtend);
  form.append('topExtend', topExtend);
  form.append('bottomExtend', bottomExtend);
  form.append('description', description);

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
    );
    startProcessingLog(`Image Modification ${version}`, 'Processing Image');

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/v3/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Bearer ' + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
    );

    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    stopProcessingLog();
    if (retries < appConfiguration.max_retries) {
      debug(
        LogStatus.INFO,
        `Image Modification ${version}`,
        `Error occurred during image modification, retrying (${retries + 1})`,
        error.message,
      );
      return extendImageBoundaries(params, retries + 1);
    } else {
      debug(
        LogStatus.ERROR,
        `Image Modification ${version}`,
        `Error occurred during image modification after maximum retries`,
      );
      throw handleAxiosError(error);
    }
  }
};

export const reCreateImageV3 = async (params: RemoveImageObjParams) => {
  return removeImageParts(params, 'recreate', (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Width metadata is missing from the image.`,
      );
      throw new Error('Width metadata is missing from the image.');
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        'Image Modification V3',
        `Height metadata is missing from the image.`,
      );
      throw new Error('Height metadata is missing from the image.');
    }
  });
};
