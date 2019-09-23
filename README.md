# fetch-curl

## Motivation

First the difficulty was making http2 requests on node through an http1 proxy. Libcurl abstracts this for us. So why not curl? With this in mind, I decided to create a lib that uses background curl but with the fetch API syntax.

## Installing

To utilize for node.js install the the `npm` module:

```bash
npm i fetch-curl --save
```

## Common Usage

### GET

- Simple GET

```js
const {fetch} = require("fetch-curl");

const res = await fetch('https://restcountries-v1.p.rapidapi.com/all');

const json = res.json();

```

### POST

- Exemple Post with all options

```js
const {fetch, Curl} = require("fetch-curl");

const res = await fetch('https://localhost/post/', {
    method: 'POST',
    body: {
        name: 'foo',
        email: 'foo@foo.com'
    },
    headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
    },
    redirect: "follow",
    follow: 5,
    proxy: 'https://localhost/proxy/',
    timeout: 30000,
    version: 1.1,
    curl: {
        verbose: true,
        opts: {
            [Curl.option.SSL_VERIFYPEER]: false
        }
    }
});

const json = res.json();
```


#### Accessing Headers and other Meta data

```js
const res = await fetch('https://github.com/')
console.log(res.ok);
console.log(res.status);
console.log(res.statusText);
console.log(res.redirected);
console.log(res.url);
console.log(res.countRedirect);
console.log(res.headers.raw());
console.log(res.headers.has('content-type'));
console.log(res.headers.get('content-type'));
```

#### Default Setings

```js
{
    verbose: false,
    method: 'GET',
    folow: 5,
    timeout: 60000,
    version: 1.1,
    redirect: 'follow'
}
```

#### Default Headers

Name              | type             | values
----------------- | -----------------|---------------------------------------
content-length    | number           | automatically calculated

### Options Request

Fetch Standartd Options

Name              | type               | values
------------------- | -----------------|---------------------------------------
body                | object           | object, string
headers             | HeaderInit       | object
method              | string           | GET, POST, PUT, DELETE, HEAD, OPTION, CONNECT
redirect            | RequestRedirect  | folow, manual, error

Fetch Curl Extension Options

Header              | type             | values
------------------- |----------------- |---------------------------------------
follow              | number           | max redirect
timeout             | number           | value in milliseconds
proxy               | string           | url
version             | number           | 1, 1.1, 2
curl                | CurlOptions      |

- Types

HeadersInit

```js
{
  [key: string]: string | number;
}
```

CurlOptions

```js
{
    verbose: boolean,
    opts: {
        [key: string]: string | number | boolean | null;
    }
}
```