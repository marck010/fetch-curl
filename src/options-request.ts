import { RequestRedirect, HttpVersion, MethodHttp } from "./custom-types";
import { HeadersInit } from "./headers";

interface CurlOptions {
  verbose?: boolean;
  opts?: {
    [option: string]: string | number | boolean | null;
  };
}

export interface OptionsRequest {
  // query?: any;
  body?: any;
  headers?: HeadersInit;
  method?: MethodHttp;
  redirect?: RequestRedirect;
  proxy?: string;
  // compress?: boolean;
  // size?: number;
  timeout?: number;
  follow?: number;
  version?: HttpVersion;
  curl?: CurlOptions;
}
