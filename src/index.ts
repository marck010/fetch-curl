import * as urlLib from 'url';
import { Curl } from 'node-libcurl';
import * as status from 'http-status';

import { Headers } from './custom-types';
import { OptionsRequest } from './options-request';
import { DefaulSetings } from './default-setings';
import { ResponseInit } from './response';

export const curlOptions = {
  ...Curl.option,
  HTTP_1: 1,
  HTTP_1_1: 2,
  HTTP_2: 3
};

export { Headers, OptionsRequest, DefaulSetings, ResponseInit };

const fetch = (url: string, options: OptionsRequest | undefined): Promise<ResponseInit> => {
  if (!url || typeof url !== 'string') {
    throw new Error('Url must be string');
  }

  if (!options) {
    options = {};
  }

  options.url = url;

  const curl = new FetchCurl(options);

  return curl.request();
};

class FetchCurl {

  private curl: Curl;
  private default: DefaulSetings;
  private options: OptionsRequest;

  constructor(options) {

    this.default = {
      verbose: false,
      method: 'GET',
      maxRedirects: 5,
      timeout: 60000,
      proxyType: 'https',
      useProxy: false,
      httpVersion: curlOptions.HTTP_2,
      redirect: 'follow'
    };

    this.curl = new Curl();
    this.options = options;

  }

  private setUrl(url: string | undefined) {
    if (!url) {
      throw new Error('Url missing');
    }

    this.curl.setOpt(curlOptions.URL, url);
  }

  private setHttpVersion(httpVersion: number | undefined) {

    httpVersion = httpVersion || this.default.httpVersion;

    if (httpVersion) {
      this.curl.setOpt(curlOptions.HTTP_VERSION, httpVersion);
    }

  }

  private setMethod(method: string | undefined) {
    method = method || this.default.method;

    if (method) {
      this.curl.setOpt(curlOptions.CUSTOMREQUEST, method);
    }
  }

  private setBody(body: any | undefined) {

    if (!body) {
      return;
    }

    this.curl.setOpt(curlOptions.POSTFIELDS, this.getBodyString(body));

  }

  private setProxy = (host: string | undefined) => {

    if (!host) {
      return;
    }

    this.curl.setOpt(curlOptions.PROXY, host);

    const parsedUrl: urlLib.Url = urlLib.parse(host);
    if (!parsedUrl.protocol) {
      throw new Error('Proxy protocol missing');
    }

    const proxyType = parsedUrl.protocol.replace(':', '');
    this.curl.setOpt(curlOptions.PROXYTYPE, proxyType);
  }

  private setFollowLocation = (redirect: RequestRedirect | undefined) => {

    redirect = redirect || this.default.redirect;

    if (redirect && redirect === 'follow') {
      const alowRedirect = 1;
      this.curl.setOpt(curlOptions.FOLLOWLOCATION, alowRedirect);
      this.curl.setOpt(curlOptions.MAXREDIRS, this.default.maxRedirects);
    }

  }

  private setTimeout(time: number | undefined) {
    time = time || this.default.timeout;

    if (time) {
      this.curl.setOpt(curlOptions.TIMEOUT_MS, time);
    }

  }

  private getDefaultHeaders(options: OptionsRequest): Headers {

    const bodyString = this.getBodyString(this.options.body);
    const bodyLenght = bodyString ? bodyString.length : 0;

    return new Headers({ 'content-length': bodyLenght });
  }

  private setHeaders = (headers: Headers | undefined, defautHeaders: Headers | undefined) => {

    if (!headers) {
      headers = new Headers();
    }

    headers = new Headers({ ...headers, ...defautHeaders });

    const headersString: string[] = Object.entries(headers).map(header => {
      const [key, value] = header;
      return `${key}: ${value}`;
    });

    this.curl.setOpt(curlOptions.HTTPHEADER, headersString);
  }

  private getBodyString(body: string) {
    return typeof body !== 'string' ? JSON.stringify(body) : body;
  }

  public request = (): Promise<ResponseInit> => {

    this.setMethod(this.options.method);
    this.setUrl(this.options.url);
    this.setBody(this.options.body);
    this.setProxy(this.options.proxy);
    this.setFollowLocation(this.options.redirect);

    const defaultHeaders = this.getDefaultHeaders(this.options);
    this.setHeaders(this.options.headers, defaultHeaders);

    this.setVerbose(this.options.verbose);
    this.setHttpVersion(this.options.version);
    this.setTimeout(this.options.timeout);

    return new Promise((resolve, reject) => {

      try {

        this.curl.on('end', (statusCode, body, headers: Headers[]) => {

          const json = () => {
            if (typeof body === 'string') {
              return body ? JSON.parse(body) : '';
            }

            throw new Error('Body is not string');

          };

          const text = (): string => {

            if (typeof body === 'string') {
              return body;
            }

            throw new Error('Body is not string');

          };

          const countRedirects = Number(this.curl.getInfo('REDIRECT_COUNT'));

          const response: ResponseInit = {
            json,
            text,
            headers: new Headers(headers[0]),
            ok: statusCode >= 200 && statusCode < 300,
            redirected: countRedirects > 0,
            countRedirect: countRedirects,
            status: statusCode,
            statusText: status[statusCode],
            url: String(this.curl.getInfo('EFFECTIVE_URL')),
          };

          this.curl.close();

          resolve(response);
        });

        this.curl.on('error', (error, errorCode) => {
          this.curl.close();
          throw error;
        });

        this.curl.perform();

      } catch (e) {
        reject(e);
      }

    });
  }

  private setVerbose(isVerbose: boolean | undefined) {
    const isVerboseOpt: boolean = isVerbose !== undefined ? isVerbose : this.default.verbose;
    this.curl.setOpt(curlOptions.VERBOSE, isVerboseOpt);
  }

}

export default fetch;
