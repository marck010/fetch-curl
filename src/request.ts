import { Curl, CurlCode, CurlHttpVersion } from "node-libcurl";
import * as urlLib from "url";
import * as queryString from "querystring";

import {
  OptionsRequest,
  DefaulSetings,
  Headers,
  Response,
  HeadersInit,
  FetchError
} from "./types";

export class Request {
  public readonly _curl: Curl;

  private readonly _options: OptionsRequest;

  private httpVersionMap: { [key: string]: number } = {
    "1": CurlHttpVersion.V1_0,
    "1.1": CurlHttpVersion.V1_1,
    "2": CurlHttpVersion.V2_0
  };

  constructor(url: string, options: OptionsRequest) {
    this._curl = new Curl();
    this._options = options;

    this.setUrl(url);
    this.setMethod();
    this.setBody();
    this.setProxy();
    this.setFollowLocation();
    this.setHeaders();
    this.setVerbose();
    this.setHttpVersion();
    this.setTimeout();
    this.setOpts();
  }

  public send(): Promise<Response> {
    return new Promise((resolve, reject) => {
      try {
        this._curl.on(
          "end",
          (statusCode: number, body: any, headers: Headers[]) => {
            try {
              const response = new Response(this, statusCode, body, headers);

              if (
                response.isRedirect(statusCode) &&
                this.options.redirect == "error"
              ) {
                reject(
                  new FetchError(
                    `redirect mode is set to error: ${response.url}`,
                    "no-redirect"
                  )
                );
              }

              resolve(response);
            } catch (error) {
              reject(new FetchError(error.message, "system", error));
            } finally {
              this._curl.close();
            }
          }
        );

        this._curl.on("error", (error, errorCode: CurlCode) => {
          this._curl.close();
          reject(new FetchError(error.message, "curl-error", error, errorCode));
        });

        this._curl.perform();
      } catch (e) {
        reject(new FetchError(e.message, "fetch-curl-error", e));
      }
    });
  }

  private get options(): OptionsRequest {
    return this._options;
  }

  private get bodyString(): string {
    const { body } = this.options;

    if (typeof body === "string") {
      return body;
    }

    if (body == undefined) {
      return "";
    }

    const contentType = this.options.headers
      ? (this.options.headers["content-type"] as string)
      : "";

    if (contentType.includes("application/json")) {
      return JSON.stringify(body);
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      return queryString.stringify(body);
    }

    return "";
  }

  private get headerStringArray(): string[] {
    const headers = { ...this.options.headers, ...this.defaultHeaders };

    return Object.entries(headers || []).map(header => {
      const [key, value] = header;
      return `${key}: ${value}`;
    });
  }

  private get default(): typeof DefaulSetings {
    return DefaulSetings;
  }

  private get defaultHeaders(): HeadersInit {
    const bodyString = this.bodyString;
    const bodyLenght = bodyString ? Buffer.byteLength(bodyString, "utf8") : 0;

    return { "content-length": bodyLenght };
  }

  private setUrl(url: string): void {
    if (!url) {
      throw new FetchError("Url missing", "url-missing");
    }

    this._curl.setOpt(Curl.option.URL, url);
  }

  private setMethod(): void {
    let { method } = this.options;
    method = method || this.default.method;

    if (method) {
      this._curl.setOpt(Curl.option.CUSTOMREQUEST, method);
    }
  }

  private setBody(): void {
    const { body } = this.options;

    if (!body) {
      return;
    }

    this._curl.setOpt(Curl.option.POSTFIELDS, this.bodyString);
  }

  private setProxy(): void {
    const { proxy } = this.options;

    if (!proxy) {
      return;
    }

    this._curl.setOpt(Curl.option.PROXY, proxy);

    const parsedUrl: urlLib.Url = urlLib.parse(proxy);

    if (!parsedUrl.protocol) {
      throw new Error("Proxy protocol missing");
    }

    const proxyType = parsedUrl.protocol.replace(":", "");
    this._curl.setOpt(Curl.option.PROXYTYPE, proxyType);
  }

  private setFollowLocation(): void {
    let { redirect } = this.options;
    const alowRedirect = true;

    redirect = redirect || this.default.redirect;

    if (redirect && redirect === "manual") {
      this._curl.setOpt(Curl.option.FOLLOWLOCATION, !alowRedirect);
    }

    if (redirect && redirect === "error") {
      this._curl.setOpt(Curl.option.FOLLOWLOCATION, !alowRedirect);
      this._curl.setOpt(Curl.option.MAXREDIRS, 0);
    }

    if (redirect && redirect === "follow") {
      const maxRedirects = this._options.follow || this.default.folow;

      this._curl.setOpt(Curl.option.FOLLOWLOCATION, alowRedirect);
      this._curl.setOpt(Curl.option.MAXREDIRS, maxRedirects);
    }
  }

  private setHeaders(): void {
    const headersString: string[] = this.headerStringArray;
    this._curl.setOpt(Curl.option.HTTPHEADER, headersString);
  }

  private setVerbose(): void {
    const { curl } = this.options;

    if (!curl) {
      return;
    }

    const verbose = curl.verbose || this.default.verbose;
    this._curl.setOpt(Curl.option.VERBOSE, verbose);
  }

  private setHttpVersion(): void {
    let { version } = this.options;

    version = version || this.default.version;

    if (version) {
      this._curl.setOpt(Curl.option.HTTP_VERSION, this.httpVersionMap[version]);
    }
  }

  private setTimeout(): void {
    let { timeout } = this.options;
    timeout = timeout || this.default.timeout;

    if (timeout) {
      this._curl.setOpt(Curl.option.TIMEOUT_MS, timeout);
    }
  }

  private setOpts(): void {
    const { curl } = this.options;

    if (!curl) {
      return;
    }

    if (curl.opts) {
      for (const [option, value] of Object.entries(curl.opts)) {
        this._curl.setOpt(parseInt(option) as never, value);
      }
    }
  }
}
