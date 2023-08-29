import { toBase64 } from "./core";

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = () => {
      resolve(toBase64(reader.result as string));
    };
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
  });
};
