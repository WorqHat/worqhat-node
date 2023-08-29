import axios from "axios";
import * as fs from "fs";
import * as Errors from "../error";
import * as Success from "../success";
import FormData from "form-data";
import { appConfiguration } from "../index";
import { ContentModerationParams, ImageModerationParams } from "../types";
import { getImageAsBase64 } from "../uploads";
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

export const imageModeration = async ({ image }: ImageModerationParams) => {
  if (!image) {
    throw new Error("Image data is required");
  }

  console.log("image: ", image);


  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }
  const timenow = new Date();

  let base64Data: string = await getImageAsBase64(image);


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
