import { OptionsRequest, Response } from "./types";
import { Request } from "./request";

export const fetch = (url: string, options?: OptionsRequest): Promise<Response> => {
  if (!options) {
    options = {};
  }

  return new Request(url, options).send();
};

export default fetch;
export * from "./types";
export * from "node-libcurl";
