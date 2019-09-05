import { Curl } from 'node-libcurl';

export const CurlOptions = {
    ...Curl.option,
    HTTP_1: 1,
    HTTP_1_1: 2,
    HTTP_2: 3
};