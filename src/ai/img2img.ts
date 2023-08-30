import axios from "axios";
import * as Errors from "../error";
import FormData from "form-data";
import * as Success from "../success";
import sharp from "sharp";
import {
  createLogger,
  baseUrl,
  debug,
  LogStatus,
  startProcessingLog,
  stopProcessingLog,
} from "../core";
import { ImageModificationParams } from "../types";
import { getImageAsBase64 } from "../uploads";
import { appConfiguration } from "../index";

const processImage = async (
  params: ImageModificationParams,
  version: string,
  validateDimensions: (metadata: any) => void,
) => {
  const { existing_image, modifications, outputType, similarity } = params;

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
    throw new Error("Image data is required");
  }

  if (!appConfiguration) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `App Configuration is null`,
    );
    throw new Error("App Configuration is null");
  }

  const timenow = new Date();
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

  let imageBuffer = Buffer.from(base64Data, "base64");

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
  form.append("existing_image", Buffer.from(base64Data, "base64"), {
    filename: "image.jpg",
    contentType: "image/jpeg",
  });
  form.append("modifications", modifications);
  form.append("outputType", outputType || "url");
  form.append("similarity", similarity.toString());

  try {
    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Processing AI Model for Image Modification`,
      modifications,
    );
    startProcessingLog(`Image Modification ${version}`);

    const response = await axios.post(
      `${baseUrl}/api/ai/images/modify/${version}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Bearer " + appConfiguration.apiKey,
        },
      },
    );

    const timeafter = new Date();
    const time = timeafter.getTime() - timenow.getTime();
    stopProcessingLog();

    debug(
      LogStatus.INFO,
      `Image Modification ${version}`,
      `Completed response from image modification API`,
      modifications,
    );

    return {
      processingTime: time,
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    debug(
      LogStatus.ERROR,
      `Image Modification ${version}`,
      `Error occurred during image modification: ${error}`,
    );
    throw error;
  }
};

export const imageModificationV2 = async (params: ImageModificationParams) => {
  return processImage(params, "v2", (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        "Image Modification V3",
        `Width metadata is missing from the image.`,
      );
      throw new Error("Width metadata is missing from the image.");
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        "Image Modification V3",
        `Height metadata is missing from the image.`,
      );
      throw new Error("Height metadata is missing from the image.");
    }

    if (metadata.width < 128 || metadata.width > 896) {
      debug(
        LogStatus.ERROR,
        "Image Modification V2",
        `Invalid image width. Width should be at least 128 and maximum supported width is 896.`,
      );
      throw new Error(
        "Invalid image width. Width should be at least 128 and maximum supported width is 896.",
      );
    }

    if (metadata.height < 128 || metadata.height > 512) {
      debug(
        LogStatus.ERROR,
        "Image Modification V2",
        `Invalid image height. Height should be at least 128 and maximum supported height is 512.`,
      );
      throw new Error(
        "Invalid image height. Height should be at least 128 and maximum supported height is 512.",
      );
    }

    if (metadata.width > 512 && metadata.height > 512) {
      debug(
        LogStatus.ERROR,
        "Image Modification V2",
        `Invalid image dimensions. Only one of width or height can be above 512.`,
      );
      throw new Error(
        "Invalid image dimensions. Only one of width or height can be above 512.",
      );
    }
  });
};

export const imageModificationV3 = async (params: ImageModificationParams) => {
  return processImage(params, "v3", (metadata) => {
    if (metadata.width === undefined) {
      debug(
        LogStatus.ERROR,
        "Image Modification V3",
        `Width metadata is missing from the image.`,
      );
      throw new Error("Width metadata is missing from the image.");
    }

    if (metadata.height === undefined) {
      debug(
        LogStatus.ERROR,
        "Image Modification V3",
        `Height metadata is missing from the image.`,
      );
      throw new Error("Height metadata is missing from the image.");
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
        "Image Modification V3",
        `Invalid image dimensions. The dimensions of the image should be one of the following: 1024x1024, 1152x896, 1216x832, 1344x768, or 1536x640.`,
      );
      throw new Error(
        "Invalid image dimensions. The dimensions of the image should be one of the following: 1024x1024, 1152x896, 1216x832, 1344x768, or 1536x640.",
      );
    }
  });
};
