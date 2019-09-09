
import { Curl, CurlCode } from 'node-libcurl';
import * as urlLib from 'url';
import * as queryString from 'querystring';

import {
    OptionsRequest,
    DefaulSetings,
    Headers,
    Response,
    HeadersInit,
    FetchError
} from './types';

export class Request {

    public readonly _curl: Curl;
    public readonly _options: OptionsRequest;

    private httpVersionMap: { [key: string]: number } = {
        '1': 1,
        '1.1': 2,
        '2': 3
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

    }

    public send(): Promise<Response> {

        return new Promise((resolve, reject) => {

            try {

                this._curl.on('end', (statusCode: number, body: any, headers: Headers[]) => {

                    try {
                        const response = new Response(this, statusCode, body, headers);

                        if (response.isRedirect(statusCode) && this.options.redirect == 'error') {
                            reject(new FetchError(`redirect mode is set to error: ${response.url}`, 'no-redirect'));
                        }

                        resolve(response);

                    } catch (error) {
                        reject(new FetchError(error.message, 'system', error));
                    } finally {
                        this._curl.close();
                    }

                });

                this._curl.on('error', (error, errorCode: CurlCode) => {
                    this._curl.close();
                    reject(new FetchError(error.message, 'curl-error', error, errorCode));
                });

                this._curl.perform();

            } catch (e) {
                reject(new FetchError(e.message, 'fetch-curl-error', e));
            }

        });
    }

    private get options(): OptionsRequest {
        return this._options;
    }

    private get bodyString(): string {
        const { body } = this.options;

        if (typeof body === 'string') {
            return body;
        }

        if (body == undefined) {
            return '';
        }

        const contentType = this.options.headers ? this.options.headers['content-type'] as string : '';

        if (contentType.includes('aplication/json')) {
            return JSON.stringify(body);
        }

        if (contentType.includes('application/x-www-form-urlencoded')) {
            return queryString.stringify(body);
        }

        return '';
    }

    private get default(): DefaulSetings {
        return {
            verbose: false,
            method: 'GET',
            folow: 5,
            timeout: 60000,
            proxyType: 'https',
            useProxy: false,
            version: 1.1,
            redirect: 'manual'
        };
    }

    private get defaultHeaders(): HeadersInit {

        const bodyString = this.bodyString;
        const bodyLenght = bodyString ? Buffer.byteLength(bodyString, 'utf8') : 0;

        return { 'content-length': bodyLenght };
    }

    private setUrl(url: string): void {
        if (!url) {
            throw new FetchError('Url missing', 'url-missing');
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
            throw new Error('Proxy protocol missing');
        }

        const proxyType = parsedUrl.protocol.replace(':', '');
        this._curl.setOpt(Curl.option.PROXYTYPE, proxyType);
    }

    private setFollowLocation(): void {
        let { redirect } = this.options;
        const alowRedirect = true;

        redirect = redirect || this.default.redirect;

        if (redirect && redirect === 'manual') {
            this._curl.setOpt(Curl.option.FOLLOWLOCATION, 0);
        }

        if (redirect && redirect === 'error') {
            this._curl.setOpt(Curl.option.FOLLOWLOCATION, !alowRedirect);
            this._curl.setOpt(Curl.option.MAXREDIRS, 0);
        }

        if (redirect && redirect === 'follow') {
            const maxRedirects = this._options.follow || this.default.folow;

            this._curl.setOpt(Curl.option.FOLLOWLOCATION, alowRedirect);
            this._curl.setOpt(Curl.option.MAXREDIRS, maxRedirects);
        }

    }

    private setHeaders(): void {
        let { headers } = this.options;

        if (!headers) {
            headers = {};
        }

        headers = { ...headers, ...this.defaultHeaders };

        const headersString: string[] = Object.entries(headers).map(header => {
            const [key, value] = header;
            return `${key}: ${value}`;
        });

        this._curl.setOpt(Curl.option.HTTPHEADER, headersString);
    }

    private setVerbose(): void {
        let { verbose } = this.options;
        verbose = verbose || this.default.verbose;
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
}