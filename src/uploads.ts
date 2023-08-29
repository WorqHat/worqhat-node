import { toBase64 } from "./core";
import axios from "axios";
import * as fs from "fs";

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = () => {
        resolve(toBase64(reader.result as string));
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
    } catch (error: any) {
      reject(new Error(`Unexpected error occurred: ${error.message}`));
    }
  });
};

export const getImageAsBase64 = async (image: string | File): Promise<string> => {
  try {
    let base64Data: string;
    if (typeof image === "string") {
      if (image.startsWith("http://") || image.startsWith("https://")) {
        const response = await axios.get(image, {
          responseType: "arraybuffer",
        });
        base64Data = Buffer.from(response.data, "binary").toString("base64");
      } else if (image.startsWith("data:image")) {
        base64Data = image.split(",")[1];
      } else {
        const fileData = await fs.promises.readFile(image);
        base64Data = fileData.toString("base64");
      }
    } else {
      base64Data = await readFileAsBase64(image);
    }
    return base64Data;
  } catch (error: any) {
    throw new Error(`Unexpected error occurred: ${error.message}`);
  }
};