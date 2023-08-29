import axios from "axios";
import * as Errors from "../error";
import * as Success from "../success";
import { appConfiguration } from "../index";
import { searchV2Params, searchV3Params } from "../types";
import { createLogger, baseUrl } from "../core";

export const v2Search = async ({ question, training_data }: searchV2Params) => {
  if (!question) {
    throw new Error("Question is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/search/v2`,
      {
        question: question,
        training_data: training_data || "",
      },
      {
        headers: {
          Authorization: "Bearer " + appConfiguration.apiKey,
        },
      },
    );

    delete response.data.time_taken;

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

export const v3Search = async ({
  question,
  training_data,
  search_count,
}: searchV3Params) => {
  if (!question) {
    throw new Error("Question is required");
  }

  const timenow = new Date();
  if (!appConfiguration) {
    throw new Error("App Configuration is null");
  }

  try {
    const response = await axios.post(
      `${baseUrl}/api/ai/search/v3`,
      {
        question: question,
        training_data: training_data || "",
        search_count: search_count || 3,
      },
      {
        headers: {
          Authorization: "Bearer " + appConfiguration.apiKey,
        },
      },
    );

    delete response.data.time_taken;

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
