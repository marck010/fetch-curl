import { RequestRedirect } from './custom-types';

export interface DefaulSetings {
  method: string;
  maxRedirects: number;
  redirect: RequestRedirect;
  verbose: any;
  useProxy?: boolean;
  proxyType?: string;
  timeout?: number;
  httpVersion?: number;
}
