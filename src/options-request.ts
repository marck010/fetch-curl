import { RequestRedirect, HttpVersion, MethodHttp } from "./custom-types";
import { HeadersInit } from "./headers";

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
  verbose?: boolean;
  version?: HttpVersion;
}
