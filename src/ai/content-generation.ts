import axios from "axios";
import { createLogger, baseUrl } from "../core";
import { appConfiguration } from "../index";
import { ContentGenerationParams, AlphaParams, LargeParams } from "../types";
import * as Errors from "../error";
import { debug, LogStatus } from "../core";

const generateContent = async (
  version: string,
  history_object: object | undefined,
  preserve_history: boolean | undefined,
  question: string | undefined,
  training_data: string | undefined,
  randomness: number | undefined,
) => {
  debug(
    LogStatus.INFO,
    `AiCon${version}`,
    "Processor function called with question:",
    question,
  );
  if (!question) {
    debug(LogStatus.ERROR, `AiCon${version}`, "Question is missing");
    throw new Error("Question is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    debug(LogStatus.ERROR, `AiCon${version}`, "App Configuration is null");
    throw new Error("App Configuration is null");
  }

  debug(
    LogStatus.INFO,
    `AiCon${version}`,
    "Processing AI Model for Content Generation",
  );
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
    debug(
      LogStatus.INFO,
      `AiCon${version}`,
      "Completed Processing from Content Generation AI Model",
    );
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error: any) {
    debug(LogStatus.ERROR, `AiCon${version}`, "Error:", error);
    throw error;
  }
};

export const v2Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
}: ContentGenerationParams) => {
  debug(LogStatus.INFO, "AiConV2", "Function called with question:", question);
  generateContent(
    "v2",
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
  );
};

export const v3Content = ({
  history_object,
  preserve_history,
  question,
  training_data,
  randomness,
}: ContentGenerationParams) => {
  debug(
    LogStatus.INFO,
    "v2Content",
    "Function called with question:",
    question,
  );
  generateContent(
    "v3",
    history_object,
    preserve_history,
    question,
    training_data,
    randomness,
  );
};

export const alphaContent = async ({ question }: AlphaParams) => {
  debug(
    LogStatus.INFO,
    "AiConV2 Alpha",
    "Function called with question:",
    question,
  );

  if (!question) {
    debug(LogStatus.ERROR, "AiConV2 Alpha", "Question is missing");
    throw new Error("Question is required");
  }

  const timenow = new Date();

  if (!appConfiguration) {
    debug(LogStatus.ERROR, "AiConV2 Alpha", "App Configuration is null");
    throw new Error("App Configuration is null");
  }

  try {
    debug(
      LogStatus.INFO,
      "AiConV2 Alpha",
      "Processing AI Model for Content Generation",
    );
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
    debug(
      LogStatus.INFO,
      "AiConV2 Alpha",
      "Completed Processing from Content Generation AI Model",
    );
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error: any) {
    debug(LogStatus.ERROR, "AiConV2 Alpha", "Error:", error);
    throw error;
  }
};

export const largeContent = async ({
  datasetId,
  question,
  randomness,
}: LargeParams) => {
  debug(
    LogStatus.INFO,
    "AiConV2 Large",
    "Function called with question & dataset:",
    { question, datasetId },
  );

  if (!question) {
    debug(LogStatus.ERROR, "AiConV2 Large", "Question is missing");
    throw new Error("Question is required");
  }

  const timenow = new Date();

  if (!appConfiguration) {
    debug(LogStatus.ERROR, "AiConV2 Large", "App Configuration is null");
    throw new Error("App Configuration is null");
  }

  if (!datasetId) {
    debug(LogStatus.ERROR, "AiConV2 Large", "Dataset ID is missing");
    throw new Error("Dataset ID is required");
  }

  if (!question) {
    debug(LogStatus.ERROR, "AiConV2 Large", "Question is missing from request");
    throw new Error("Question is required");
  }

  try {
    debug(
      LogStatus.INFO,
      "AiConV2 Large",
      "Processing AI Model for Answer Generation",
    );
    const response = await axios.post(
      `${baseUrl}/api/ai/content/v2-large/answering`,
      {
        datasetId: datasetId,
        question: question,
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
    debug(
      LogStatus.INFO,
      "AiConV2 Large",
      "Completed Processing from Answer Generation AI Model",
    );
    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error: any) {
    debug(LogStatus.ERROR, "AiConV2 Large", "Error:", error);
    throw error;
  }
};
