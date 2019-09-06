
import { Curl } from 'node-libcurl';
import * as urlLib from 'url';
import * as status from 'http-status';

import { CurlOptions } from './curl-options';
import { OptionsRequest, DefaulSetings, Headers, ResponseInit } from './types';

export class Request {

    private readonly _curl: Curl;
    private readonly _options: OptionsRequest;

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

    }

    public send(): Promise<ResponseInit> {

        return new Promise((resolve, reject) => {

            try {

                this._curl.on('end', (statusCode, body, headers: Headers[]) => {

                    try {
                        const json = (): any => {

                            if (typeof body === 'string') {
                                return body ? JSON.parse(body) : '';
                            }

                            return {};
                        };

                        const text = (): string => {

                            if (typeof body === 'string') {
                                return body;
                            }

                            return '';
                        };

                        const countRedirects = Number(this._curl.getInfo('REDIRECT_COUNT'));

                        const response: ResponseInit = {
                            json,
                            text,
                            headers: new Headers(headers[0]),
                            ok: statusCode >= 200 && statusCode < 300,
                            redirected: countRedirects > 0,
                            countRedirect: countRedirects,
                            status: statusCode,
                            statusText: status[statusCode],
                            url: String(this._curl.getInfo('EFFECTIVE_URL')),
                        };

                        this._curl.close();

                        resolve(response);

                    } catch (error) {
                        reject(error);
                    }
                });

                this._curl.on('error', (error, errorCode) => {
                    this._curl.close();
                    reject(error);
                });

                this._curl.perform();

            } catch (e) {
                reject(e);
            }

        });
    }

    private get options(): OptionsRequest {
        return this._options;
    }

    private get bodyString(): string {
        const { body } = this.options;

        return typeof body !== 'string' ? JSON.stringify(body) : body;
    }

    private get default(): DefaulSetings {
        return {
            verbose: false,
            method: 'GET',
            folow: 5,
            timeout: 60000,
            proxyType: 'https',
            useProxy: false,
            version: CurlOptions.HTTP_1_1,
            redirect: 'follow'
        };;
    }

    private get defaultHeaders(): Headers {

        const bodyString = this.bodyString;
        const bodyLenght = bodyString ? Buffer.byteLength(bodyString, 'utf8') : 0;

        return new Headers({ 'content-length': bodyLenght });
    }

    private setUrl(url: string): void {
        if (!url) {
            throw new Error('Url missing');
        }

        this._curl.setOpt(CurlOptions.URL, url);
    }

    private setMethod(): void {
        let { method } = this.options;
        method = method || this.default.method;

        if (method) {
            this._curl.setOpt(CurlOptions.CUSTOMREQUEST, method);
        }
    }

    private setBody(): void {
        const { body } = this.options;

        if (!body) {
            return;
        }

        this._curl.setOpt(CurlOptions.POSTFIELDS, this.bodyString);

    }

    private setProxy(): void {
        let { proxy } = this.options;

        if (!proxy) {
            return;
        }

        this._curl.setOpt(CurlOptions.PROXY, proxy);

        const parsedUrl: urlLib.Url = urlLib.parse(proxy);
        if (!parsedUrl.protocol) {
            throw new Error('Proxy protocol missing');
        }

        const proxyType = parsedUrl.protocol.replace(':', '');
        this._curl.setOpt(CurlOptions.PROXYTYPE, proxyType);
    }

    private setFollowLocation(): void {
        let { redirect } = this.options;

        redirect = redirect || this.default.redirect;

        if (redirect && redirect === 'follow') {
            const alowRedirect = 1;
            this._curl.setOpt(CurlOptions.FOLLOWLOCATION, alowRedirect);
            this._curl.setOpt(CurlOptions.MAXREDIRS, this._options.follow || this.default.folow);
        }

    }

    private setHeaders(): void {
        let { headers } = this.options;

        if (!headers) {
            headers = {};
        }

        headers = new Headers({ ...headers, ...this.defaultHeaders });

        const headersString: string[] = Object.entries(headers).map(header => {
            const [key, value] = header;
            return `${key}: ${value}`;
        });

        this._curl.setOpt(CurlOptions.HTTPHEADER, headersString);
    }

    private setVerbose(): void {
        let { verbose } = this.options;
        verbose = verbose || this.default.verbose;
        this._curl.setOpt(CurlOptions.VERBOSE, verbose);
    }

    private setHttpVersion(): void {
        let { version } = this.options;

        version = version || this.default.version;

        if (version) {
            this._curl.setOpt(CurlOptions.HTTP_VERSION, version);
        }

    }

    private setTimeout(): void {
        let { timeout } = this.options;
        timeout = timeout || this.default.timeout;

        if (timeout) {
            this._curl.setOpt(CurlOptions.TIMEOUT_MS, timeout);
        }
    }
}