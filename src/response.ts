import * as status from "http-status";

import { Headers } from "./headers";
import { Request } from "./request";

export class Response {
  public headers: Headers;
  public ok: boolean;
  public redirected?: boolean;
  public countRedirect?: number;
  public status?: number;
  public statusText?: string;
  public url?: string;
  public json: () => any;
  public text: () => string;

  constructor(req: Request, statusCode: number, body: any, headers: Headers[]) {
    const countRedirects = Number(req._curl.getInfo("REDIRECT_COUNT"));

    this.json = this.getFuncJson(body);
    this.text = this.getFuncText(body);
    this.headers = new Headers(headers[0]);
    this.ok = statusCode >= 200 && statusCode < 300;
    this.redirected = countRedirects > 0;
    this.countRedirect = countRedirects;
    this.status = statusCode;
    this.statusText = status[statusCode];
    this.url = String(req._curl.getInfo("EFFECTIVE_URL"));
  }

  public isRedirect(code) {
    return (
      code === 301 ||
      code === 302 ||
      code === 303 ||
      code === 307 ||
      code === 308
    );
  }

  private getFuncText(body: any) {
    return (): string => {
      if (typeof body === "string") {
        return body;
      }
      return "";
    };
  }

  private getFuncJson(body: any) {
    return (): any => {
      if (typeof body === "string") {
        return body ? JSON.parse(body) : "";
      }
      return {};
    };
  }
}
