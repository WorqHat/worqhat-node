import { toBase64 } from "./core";
import { debug, LogStatus } from "./core";
import axios from "axios";
import * as fs from "fs";

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      debug(LogStatus.INFO, "Reading Base64 Image", `Starting to read file`);
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = () => {
        debug(LogStatus.INFO, "Reading Base64 Image", `File read successfully`);
        resolve(toBase64(reader.result as string));
        debug(
          LogStatus.INFO,
          "Reading Base64 Image",
          `File converted to base64`,
        );
      };
      reader.onerror = () => {
        debug(LogStatus.ERROR, "Reading Base64 Image", `Error reading file`);
        reject(new Error("Error reading file"));
      };
    } catch (error: any) {
      debug(
        LogStatus.ERROR,
        "Reading Base64 Image",
        `Unexpected error occurred: ${error.message}`,
      );
      reject(new Error(`Unexpected error occurred: ${error.message}`));
    }
  });
};

export const getImageAsBase64 = async (
  image: string | File,
): Promise<string> => {
  try {
    let base64Data: string;
    if (typeof image === "string") {
      debug(
        LogStatus.INFO,
        "Processing Image",
        `Processing image of type string`,
      );
      if (image.startsWith("http://") || image.startsWith("https://")) {
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Processing image of type URL: ${image}`,
        );
        const response = await axios.get(image, {
          responseType: "arraybuffer",
        });
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Received response from URL: ${image}`,
        );
        base64Data = Buffer.from(response.data, "binary").toString("base64");
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Converted response data to base64`,
        );
      } else if (image.startsWith("data:image")) {
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Processing image of type data URL: ${image}`,
        );
        base64Data = image.split(",")[1];
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Extracted base64 data from data URL`,
        );
      } else {
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Processing image of type file path: ${image}`,
        );
        const fileData = await fs.promises.readFile(image);
        base64Data = fileData.toString("base64");
        debug(
          LogStatus.INFO,
          "Processing Image",
          `Read file and converted to base64`,
        );
      }
    } else {
      debug(
        LogStatus.INFO,
        "Processing Image",
        `Processing image of type File object`,
      );
      base64Data = await readFileAsBase64(image);
      debug(
        LogStatus.INFO,
        "Processing Image",
        `Read File object and converted to base64`,
      );
    }
    return base64Data;
  } catch (error: any) {
    debug(
      LogStatus.ERROR,
      "Processing Image",
      `Unexpected error occurred: ${error.message}`,
    );
    throw new Error(`Unexpected error occurred: ${error.message}`);
  }
};
