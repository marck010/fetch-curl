import { RequestRedirect } from './custom-types';

export interface DefaulSetings {
  method: string;
  maxRedirects: number;
  redirect: RequestRedirect;
  verbose: boolean;
  useProxy: boolean;
  proxyType: string;
  timeout: number;
  version: number;
}
