import { RequestRedirect, MethodHttp, HttpVersion } from "./custom-types";

export class DefaulSetings {
  public static method: MethodHttp = "GET";
  public static folow: number = 5;
  public static redirect: RequestRedirect = "manual";
  public static verbose: boolean = false;
  public static useProxy: boolean = false;
  public static proxyType: string = "https";
  public static timeout: number = 60000;
  public static version: HttpVersion = 1.1;
}
