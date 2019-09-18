# fetch-curl

## Motivation

First the difficulty was making http2 requests on node through an http1 proxy. Libcurl abstracts this for us. So why not curl? With this in mind, I decided to create a lib that uses background curl but with the fetch API syntax.

## Installing

To utilize for node.js install the the `npm` module:

```bash
npm i fetch-curl --save
```

## Common Usage

### Simple GET

- GET

```js
const res = await fetch('https://restcountries-v1.p.rapidapi.com/all');

const json = res.json();

console.log(json)
```

- Simple get with http 2

```js
const json = res.json();

const res = await fetch('https://exemple.com/', {
        version: 2,
        method: 'GET'
    });

const json = res.json();
```


### POST

- Simple post with body and header

```js
const res = await fetch('https://foo/', {
        method: 'POST',
        body: {
            name: 'foo',
            email:'foo@foo.com'
        }
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    });
```

#### Default Setings

```js
{
    verbose: false,
    method: 'GET',
    folow: 5,
    timeout: 60000,
    proxyType: 'https',
    useProxy: false,
    version: 1.1,
    redirect: 'follow'
}
```

### All Options

Header              | type             | values
------------------- | -----------------|---------------------------------------
body                | any              | object, string
headers             | Headers          | object
method              | string           | GET, POST, PUT, DELETE, HEAD, OPTION, CONNECT
redirect            | RequestRedirect  | folow, manual, error
proxy               | string           | url
timeout             | number           | value in milliseconds
follow              | number           | numbr max of redirect
verbose             | boolean          | true, false
version             | number           | 1, 1.1, 2
