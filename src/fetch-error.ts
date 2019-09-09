import { CurlCode } from 'node-libcurl';

export class FetchError extends Error {

    public message: string;
    public type: string;
    public code: string;
    public originErr: string;

    constructor(message: string, type: string, error?: any, curlCode?: CurlCode) {
        super(error);

        this.message = message;
        this.type = type;
        this.originErr = error;

        if (curlCode) {
            this.code = curlCode.toString();
        }

        Error.captureStackTrace(this, this.constructor);
    }
}