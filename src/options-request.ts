import {  CurlOption } from 'node-libcurl';

import { RequestRedirect, HttpVersion, MethodHttp } from './custom-types';
import { HeadersInit } from './headers';

export interface OptionsRequest {
  // query?: any;
  body?: any;
  headers?: HeadersInit;
  url?: string;
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
