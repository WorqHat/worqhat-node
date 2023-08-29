import axios from "axios";
import { createLogger, baseUrl } from "../core";
import { appConfiguration } from "../index";
import { ContentGenerationParams, AlphaParams } from "../types";
import * as Errors from "../error";

const generateContent = async (
  version: string,
  history_object: object | undefined,
  preserve_history: boolean | undefined,
  question: string | undefined,
  training_data: string | undefined,
  randomness: number | undefined,
) => {
  if (!question) {
    throw new Error("Question is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/content/${version}`,
      {
        history_object: history_object || {},
        preserve_history: preserve_history || false,
        question: question,
        training_data: training_data || "",
        randomness: randomness || 0.2,
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
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

export const v2Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
}: ContentGenerationParams) =>
  generateContent(
    "v2",
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
  );

export const v3Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
}: ContentGenerationParams) =>
  generateContent(
    "v3",
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
  );

export const alphaContent = async ({ question }: AlphaParams) => {
  if (!question) {
    throw new Error("Question is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/content/v2/new/alpha`,
      {
        question: question,
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
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};
