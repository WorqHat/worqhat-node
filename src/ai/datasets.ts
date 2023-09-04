import axios from "axios";
import { createLogger, baseUrl, debug, LogStatus } from "../core";
import { appConfiguration } from "../index";
import { deleteDatasetParam } from "../types";
import { handleAxiosError } from "../error";

export const viewTrainedDatasets = async () => {
  debug(LogStatus.INFO, "View Datasets", "Starting Dataset View Process");
  if (!appConfiguration) {
    debug(LogStatus.ERROR, "View Datasets", "App Configuration is null");
    throw new Error("App Configuration is null");
  }
  const timenow = new Date();
  try {
    debug(LogStatus.INFO, "View Datasets", "Sending request to View Datasets");
    const response = await axios.get(
      "https://api.worqhat.com/api/list-datasets",
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
      "View Datasets",
      "Dataset View Process completed successfully",
    );

    return {
      code: 200,
      processingTime: time,
      ...response.data,
    };
  } catch (error) {
    debug(
      LogStatus.ERROR,
      "View Datasets",
      "Dataset View Process failed",
      error,
    );
    throw handleAxiosError(error);
  }
};

export const deleteTrainedDatasets = async ({
  datasetId,
}: deleteDatasetParam) => {
  debug(LogStatus.INFO, "Delete Datasets", "Starting Dataset Deletion Process");
  if (!appConfiguration) {
    debug(LogStatus.ERROR, "Delete Datasets", "App Configuration is null");
    throw new Error("App Configuration is null");
  }

  if (!datasetId) {
    debug(LogStatus.ERROR, "Delete Datasets", "Dataset ID is required");
    throw new Error("Dataset ID is required");
  }
  const timenow = new Date();

  debug(
    LogStatus.INFO,
    "Delete Datasets",
    "Deleting dataset with ID:",
    datasetId,
  );
  axios
    .delete(`${baseUrl}/api/delete-datasets/${datasetId}`, {
      headers: {
        Authorization: "Bearer " + appConfiguration.apiKey,
      },
    })
    .then((response) => {
      debug(LogStatus.INFO, "Delete Datasets", "Dataset deleted successfully");
      const timeafter = new Date();
      const time = timeafter.getTime() - timenow.getTime();
      return {
        code: 200,
        processingTime: time,
      };
    })
    .catch((error) => {
      debug(
        LogStatus.ERROR,
        "Delete Datasets",
        "Dataset deletion failed",
        error,
      );
      throw handleAxiosError(error);
    });
};
