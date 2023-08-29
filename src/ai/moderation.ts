import axios from "axios";
import * as fs from "fs";
import * as Errors from "../error";
import * as Success from "../success";
import FormData from "form-data";
import { appConfiguration } from "../index";
import { ContentModerationParams, ImageModerationParams } from "../types";
import { readFileAsBase64 } from "../uploads";
import { createLogger, baseUrl } from "../core";

export const contentModeration = async ({
  text_content,
}: ContentModerationParams) => {
  if (!text_content) {
    throw new Error("Text Content is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/content-moderation/v1`,
      {
        text_content: text_content || "",
      },
      {
        headers: {
          Authorization: "Bearer " + appConfiguration.apiKey,
        },
      },
    );

    const timeafter = new Date();
    const time = timeafter.getTime() - timenow.getTime();
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error: any) {
    console.log("Error: ", error);
    throw error;
  }
};

export const imageModeration = async ({ imageData }: ImageModerationParams) => {
  if (!imageData) {
    throw new Error("Image data is required");
  }

  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }
  const timenow = new Date();

  let base64Data: string;

  if (typeof imageData === "string") {
    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      // If imageData is a URL, download the image and convert it to base64
      const response = await axios.get(imageData, {
        responseType: "arraybuffer",
      });
      base64Data = Buffer.from(response.data, "binary").toString("base64");
    } else if (imageData.startsWith("data:image")) {
      // If imageData is base64 data, use it directly
      base64Data = imageData.split(",")[1];
    } else {
      // If imageData is a file path, read the file and convert it to base64
      const fileData = await fs.promises.readFile(imageData);
      base64Data = fileData.toString("base64");
    }
  } else {
    // If imageData is a File object, read the file and convert it to base64
    base64Data = await readFileAsBase64(imageData);
  }

  const form = new FormData();
  // Append the image as a file
  form.append("image", Buffer.from(base64Data, "base64"), {
    filename: "image.jpg",
    contentType: "image/jpeg",
  });

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/images/v2/image-moderation`,
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
    return {
      processingTime: time,
      code: 200,
      ...response.data,
    };
  } catch (error: any) {
    console.log("Error: ", error);
    throw error;
  }
};
