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
  follow?: number;
  size?: number;
  timeout?: number;
  verbose?: boolean;
  allowRetry?: boolean;
  version?: number;
}
