import axios from "axios";
import FormData from "form-data";
import { appConfiguration } from "../index";
import path from "path";
import {
  WebExtractionParams,
  PDFExtractionParams,
  ImageExtractionParams,
  SpeechExtractionParams,
} from "../types";
import * as Errors from "../error";
import fs from "fs";
import { createLogger, baseUrl, debug, LogStatus, startProcessingLog, stopProcessingLog } from "../core";
import { getImageAsBase64 } from "../uploads";

export const webExtraction = async (params: WebExtractionParams) => {
  debug(LogStatus.INFO, `Web Extraction`, "Starting Web Extraction Process");
  const timenow = new Date();

  if (!appConfiguration) {
    debug(LogStatus.ERROR, `Web Extraction`, "App Configuration is null");
    throw new Error("App Configuration is null");
  }
  if (!params.url_path) {
    debug(LogStatus.ERROR, `Web Extraction`, "URL is required");
    throw new Error("URL is required");
  }
  try {
    debug(
      LogStatus.INFO,
      `Web Extraction`,
      "Sending request to Web Extraction AI Model",
    );
    startProcessingLog('Web Extraction');
    const response = await axios.post(
      `${baseUrl}/api/ai/v2/web-extract`,
      {
        code_blocks: params.code_blocks,
        headline: params.headline,
        inline_code: params.inline_code,
        references: params.references,
        url_path: params.url_path,
      },
      {
        headers: {
          Authorization: "Bearer " + appConfiguration.apiKey,
          "Content-Type": "application/json",
        },
      },
    );
    stopProcessingLog();
    debug(
      LogStatus.INFO,
      `Web Extraction`,
      "Web Extraction Process completed successfully",
    );

    const timeafter = new Date();
    const time = timeafter.getTime() - timenow.getTime();
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error) {
    console.error(error);
  }
};

export const PDFExtraction = async ({
  file,
  output_format,
}: PDFExtractionParams) => {
  if (!appConfiguration) {
    debug(LogStatus.ERROR, "PDF Extraction", "App Configuration is null");
    throw new Error("App Configuration is null");
  }
  if (!file) {
    debug(LogStatus.ERROR, "PDF Extraction", "Unable to identify file");
    throw new Error("Unable to identify file");
  }
  if (!output_format || !["text", "json"].includes(output_format)) {
    debug(LogStatus.ERROR, "PDF Extraction", "Invalid output format");
    throw new Error("Invalid output format");
  }

  const form = new FormData();

  if (file) {
    form.append("file", fs.createReadStream(file.path), {
      filename: file.name,
      contentType: "application/pdf",
    });
  }

  form.append("output_format", output_format);

  try {
    debug(
      LogStatus.INFO,
      "PDF Extraction",
      "Sending request to PDF Extraction AI Model",
    );
    startProcessingLog('PDF Extraction');
    const response = await axios.post(
      `${baseUrl}/api/ai/v2/pdf-extract`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: "Bearer " + appConfiguration.apiKey,
        },
      },
    );

    stopProcessingLog();
    debug(
      LogStatus.INFO,
      "PDF Extraction",
      "PDF Extraction Process completed successfully",
    );
    return {
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    debug(
      LogStatus.ERROR,
      "PDF Extraction",
      `Error occurred during PDF Extraction: ${error}`,
    );
    throw error;
  }
};

export const imageExtraction = async ({ image }: ImageExtractionParams) => {
  try {
    debug(
      LogStatus.INFO,
      "Image Extraction",
      `Starting image extraction process`,
    );

    if (!image) {
      debug(LogStatus.ERROR, "Image Extraction", `Image data is missing`);
      throw new Error("Image data is required");
    }

    if (!appConfiguration) {
      debug(LogStatus.ERROR, "Image Extraction", `App Configuration is null`);
      throw new Error("App Configuration is null");
    }

    const timenow = new Date();
    debug(LogStatus.INFO, "Image Extraction", `Received Image data`);
    debug(LogStatus.INFO, "Image Extraction", `Converting image to base64`);
    let base64Data: string = await getImageAsBase64(image);

    const form = new FormData();
    // Append the image as a file
    debug(LogStatus.INFO, "Image Extraction", `AI Models processing image`);
    form.append("image", Buffer.from(base64Data, "base64"), {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    debug(
      LogStatus.INFO,
      "Image Extraction",
      `Sending request for image extraction`,
    );
    startProcessingLog('Image Extraction');
    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/image-text-detection`,
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
      "Image Extraction",
      `Image extraction process completed`,
    );
    return {
      processingTime: time,
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    debug(
      LogStatus.ERROR,
      "Image Extraction",
      `Error occurred during image extraction: ${error.message}`,
    );
    throw error;
  }
};

export const speechExtraction = async ({ audio }: SpeechExtractionParams) => {
  try {
    let timenow = new Date();
    debug(
      LogStatus.INFO,
      "Speech Extraction",
      `Starting speech extraction process`,
    );

    if (!audio) {
      debug(LogStatus.ERROR, "Speech Extraction", `Audio data is missing`);
      throw new Error("Audio data is required");
    }

    if (!appConfiguration) {
      debug(LogStatus.ERROR, "Speech Extraction", `App Configuration is null`);
      throw new Error("App Configuration is null");
    }

    const form = new FormData();
    // Append the audio as a file
    debug(LogStatus.INFO, "Speech Extraction", `AI Models processing audio`);

    // Check if audio is a Blob
    if (audio instanceof Blob) {
      form.append("audio", audio, {
        filename: "audio.mp3",
        contentType: "audio/mpeg", // Update this based on your audio file type
      });
    } else {
      // Assume audio is a file path
      form.append("audio", fs.createReadStream(audio), {
        filename: path.basename(audio),
        contentType: "audio/mpeg", // Update this based on your audio file type
      });
    }

    debug(
      LogStatus.INFO,
      "Speech Extraction",
      `Sending request for speech extraction`,
    );
    const response = await axios.post(`${baseUrl}/api/ai/speech-text`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: "Bearer " + appConfiguration.apiKey,
      },
    });

    debug(
      LogStatus.INFO,
      "Speech Extraction",
      `Speech extraction process completed`,
    );
    let timeafter = new Date();
    let time = timeafter.getTime() - timenow.getTime();
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error: any) {
    debug(
      LogStatus.ERROR,
      "Speech Extraction",
      `Error occurred during speech extraction: ${error.message}`,
    );
    throw error;
  }
};
