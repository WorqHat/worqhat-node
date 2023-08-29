import axios from "axios";
import { createLogger, baseUrl, debug, LogStatus } from "../core";
import { appConfiguration } from "../index";
import { deleteDatasetParam } from "../types";
import * as Errors from "../error";

export const viewTrainedDatasets = async () => {};

export const deleteTrainedDatasets = async ({
  datasetId,
}: deleteDatasetParam) => {
  if (!appConfiguration) {
    debug(LogStatus.ERROR, "Delete Datasets", "App Configuration is null");
    throw new Error("App Configuration is null");
  }

  if (!datasetId) {
    debug(LogStatus.ERROR, "Delete Datasets", "Dataset ID is required");
    throw new Error("Dataset ID is required");
  }

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
      console.log(response.data);
    })
    .catch((error) => {
      debug(
        LogStatus.ERROR,
        "Delete Datasets",
        "Dataset deletion failed",
        error,
      );
      console.error(error);
    });
};
