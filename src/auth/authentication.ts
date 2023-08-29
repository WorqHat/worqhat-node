import axios from "axios";
import * as Errors from "../error";
import * as Success from "../success";
import { createLogger, baseUrl } from "../core";

export const authenticate = function (
  api_key: string | undefined,
): Promise<any> {
  var timenow = new Date();
  return new Promise((resolve, reject) => {
    axios
      .post(
        baseUrl + "/authentication",
        {},
        {
          headers: {
            Authorization: "Bearer " + api_key,
          },
        },
      )
      .then((response) => {
        var timeafter = new Date();
        var time = timeafter.getTime() - timenow.getTime();
        resolve({
          code: 200,
          processingTime: time,
          ...response.data,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
