import { RequestRedirect, MethodHttp, HttpVersion } from './custom-types';

export interface DefaulSetings {
  method: MethodHttp;
  folow: number;
  redirect: RequestRedirect;
  verbose: boolean;
  useProxy: boolean;
  proxyType: string;
  timeout: number;
  version: HttpVersion;
}
