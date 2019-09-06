import { Headers, RequestRedirect } from './custom-types';
import { MethodHttp } from './types';

export interface OptionsRequest {
  query?: any;
  body?: any;
  headers?: HeadersInit;
  url?: string;
  method?: MethodHttp;
  redirect?: RequestRedirect;
  proxy?: string;
  compress?: boolean;
  size?: number;
  timeout?: number;
  follow?: number;
  verbose?: boolean;
  version?: number;
}
