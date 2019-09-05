import { Headers, RequestRedirect } from './custom-types';

export interface OptionsRequest {
  query?: any;
  body?: any;
  headers?: Headers;
  url?: string;
  method?: string;
  redirect?: RequestRedirect;
  proxy?: string;
  compress?: boolean;
  size?: number;
  timeout?: number;
  follow?: number;
  verbose?: boolean;
  version?: number;
}
