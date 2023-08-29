import axios from "axios";
import * as Errors from "../error";
import * as Success from "../success";
import { appConfiguration } from "../index";
import { ImageGenV2Params, ImageGenV3Params } from "../types";
import { createLogger, baseUrl } from "../core";

const generateImage = async (
  version: string,
  orientation: string,
  image_style: string,
  output_type: string,
  prompt: any[],
) => {
  if (prompt.length === 0) {
    throw new Error("Prompt is required");
  }

  let height = 512;
  let width = 512;

  orientation = orientation.toLowerCase();

  if (orientation === "square") {
    height = 512;
    width = 512;
  } else if (orientation === "landscape") {
    height = 512;
    width = 768;
  } else if (orientation === "portrait") {
    height = 768;
    width = 512;
  } else {
    throw new Error("Orientation is invalid");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/images/generate/${version}`,
      {
        height: height || 512,
        image_style: image_style || "Default",
        output_type: output_type || "url",
        prompt: prompt.length > 0 ? prompt : ["This is the prompt"],
        width: width || 512,
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

export const v2ImageGen = ({
  orientation,
  image_style,
  output_type,
  prompt,
}: ImageGenV2Params) =>
  generateImage(
    "v2",
    orientation || "Square",
    image_style || "default",
    output_type || "url",
    prompt,
  );

export const v3ImageGen = ({
  orientation,
  image_style,
  output_type,
  prompt,
}: ImageGenV3Params) =>
  generateImage(
    "v3",
    orientation || "Square",
    image_style || "default",
    output_type || "url",
    prompt,
  );