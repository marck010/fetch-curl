import * as chai from "chai";
import * as sinon from "sinon";
import { Curl } from "node-libcurl";
import * as urlLib from "url";

import fetch from "../../src";
import { Request } from "../../src/request";
import { OptionsRequest, HeadersInit, Response, Headers } from "../../src/types";

const expect = chai.expect;

(async () => {

    describe("Unit Tests", () => {

        describe("Class Request", () => {
            afterEach(() => {
                // Restore the default sandbox here
                sinon.restore();
            });

            describe("Method bodyString", () => {
                const request = newRequest();
                it("bodyString return should be equal option.body", async () => {
                    const bodyStringReturned = request["bodyString"];
                    const bodyString = JSON.stringify(request["options"].body);

                    expect(bodyStringReturned).be.equal(bodyString);
                });
            });

            describe("Method setBody", () => {

                describe("With body", () => {

                    it(`SetOpt params should be equal ${Curl.option.POSTFIELDS} and bodyString`, async () => {

                        const request = newRequest();
                        const bodyString = JSON.stringify(request["options"].body);

                        const setOpt = sinon.spy(request["_curl"], "setOpt");
                        request["setBody"]();
                        const [opt, value] = setOpt.args[0];

                        expect(opt).be.equal(Curl.option.POSTFIELDS);
                        expect(value).be.equal(bodyString);

                    });
                });

                describe("Without body", () => {

                    it(`SetOpt should not be called`, async () => {
                        const request = newRequest("", { body: undefined });

                        const setOpt = sinon.spy(request["_curl"], "setOpt");
                        request["setBody"]();

                        expect(setOpt.callCount).be.equal(0);

                    });
                });
            });

            describe("Method setFollowLocation", () => {

                describe("With redirect 'follow'", () => {
                    const follow = 5;
                    const request = newRequest("", { redirect: "follow", follow: follow });

                    const setOpt = sinon.spy(request["_curl"], "setOpt");
                    request["setFollowLocation"]();

                    const [firstCall, secondCall] = setOpt.args;
                    const [opt1, value1] = firstCall;
                    const [opt2, value2] = secondCall;

                    it(`First call SetOpt should be params equal ${Curl.option.FOLLOWLOCATION} and true`, async () => {
                        expect(opt1).be.equal(Curl.option.FOLLOWLOCATION);
                        expect(value1).be.equal(true);
                    });

                    it(`Second call SetOpt params should be params equal ${Curl.option.MAXREDIRS} and ${follow}`, async () => {
                        expect(opt2).be.equal(Curl.option.MAXREDIRS);
                        expect(value2).be.equal(follow);
                    });
                });

                describe("With redirect 'manual'", () => {

                    const request = newRequest("", { redirect: "manual" });

                    const setOpt = sinon.spy(request["_curl"], "setOpt");

                    request["setFollowLocation"]();

                    const [firstCall] = setOpt.args;
                    const [opt1, value1] = firstCall;

                    it(`First SetOpt params should be equal ${Curl.option.FOLLOWLOCATION} and false`, async () => {
                        expect(opt1).be.equal(Curl.option.FOLLOWLOCATION);
                        expect(value1).be.equal(false);
                    });
                });

                describe("With redirect 'error'", () => {
                    const request = newRequest("", { redirect: "error" });

                    const setOpt = sinon.spy(request["_curl"], "setOpt");

                    request["setFollowLocation"]();

                    const [firstCall, secondCall] = setOpt.args;
                    const [opt1, value1] = firstCall;
                    const [opt2, value2] = secondCall;

                    it(`First SetOpt params should be equal ${Curl.option.FOLLOWLOCATION} and false`, async () => {
                        expect(opt1).be.equal(Curl.option.FOLLOWLOCATION);
                        expect(value1).be.equal(false);
                    });

                    it(`Second call SetOpt params should be params equal ${Curl.option.MAXREDIRS} and 0`, async () => {
                        expect(opt2).be.equal(Curl.option.MAXREDIRS);
                        expect(value2).be.equal(0);
                    });
                });
            });

            describe("Method headerStringArray", () => {
                const request = newRequest();
                it("headerStringArray return should be equal option.headers", async () => {
                    const headerStringArrayReturned = request["headerStringArray"];
                    const headerStringArray = Object.entries(request["options"].headers || []).map(header => {
                        const [key, value] = header;
                        return `${key}: ${value}`;
                    });

                    expect(headerStringArrayReturned ? headerStringArrayReturned.toString() : "").be.equal(headerStringArray.toString());
                });
            });

            describe("Method setHeaders", () => {
                describe("With header", () => {
                    const request = newRequest();
                    const headerStringArray = getHeaderStringArray(request["headers"]);
                    const setOpt = sinon.spy(request["_curl"], "setOpt");

                    request["setHeaders"]();

                    const [firstCall] = setOpt.args;
                    const [opt1, value1] = firstCall;

                    it(`SetOpt params should be equal ${Curl.option.HTTPHEADER} and headerStringArray`, async () => {
                        expect(opt1).be.equal(Curl.option.HTTPHEADER);
                        expect(value1 ? value1.toString() : "").be.equal(headerStringArray.toString());
                    });
                });

                describe("Without header", () => {
                    const request = newRequest("", { headers: undefined });
                    const defautHeadersStringArray = getHeaderStringArray(request["defaultHeaders"]);
                    const setOpt = sinon.spy(request["_curl"], "setOpt");

                    request["setHeaders"]();

                    const [firstCall] = setOpt.args;
                    const [opt1, value1] = firstCall;

                    it(`SetOpt params should be equal ${Curl.option.HTTPHEADER} and defautHeadersStringArray`, async () => {
                        expect(opt1).be.equal(Curl.option.HTTPHEADER);
                        expect(value1 ? value1.toString() : "").be.equal(defautHeadersStringArray.toString());
                    });
                });
            });

            describe("Method setHttpVersion", () => {
                const version = 1.1;
                const request = newRequest("", { version });

                const setOpt = sinon.spy(request["_curl"], "setOpt");

                request["setHttpVersion"]();

                const [firstCall] = setOpt.args;
                const [opt1, value1] = firstCall;

                it(`SetOpt params should be equal ${Curl.option.HTTP_VERSION} and ${version}`, async () => {
                    expect(opt1).be.equal(Curl.option.HTTP_VERSION);
                    expect(value1).be.equal(request["httpVersionMap"][version]);
                });
            });

            describe("Method setMethod", () => {
                const method = "POST";
                const request = newRequest("", { method });

                const setOpt = sinon.spy(request["_curl"], "setOpt");

                request["setMethod"]();

                const [firstCall] = setOpt.args;
                const [opt1, value1] = firstCall;

                it(`SetOpt params should be equal ${Curl.option.CUSTOMREQUEST} and ${method}`, async () => {
                    expect(opt1).be.equal(Curl.option.CUSTOMREQUEST);
                    expect(value1).be.equal(method);
                });
            });

            describe("Method setProxy", () => {

                describe("With protocol ", () => {
                    const proxy = "http://localhost:9000";
                    const request = newRequest("", { proxy });

                    const setOpt = sinon.spy(request["_curl"], "setOpt");

                    request["setProxy"]();

                    const [firstCall, secondCall] = setOpt.args;
                    const [opt1, value1] = firstCall;
                    const [opt2, value2] = secondCall;

                    it(`First setOpt params should be equal ${Curl.option.PROXY} and ${proxy}`, async () => {
                        expect(opt1).be.equal(Curl.option.PROXY);
                        expect(value1).be.equal(proxy);
                    });

                    const parsedUrl: urlLib.Url = urlLib.parse(proxy);
                    const proxyType = parsedUrl.protocol ? parsedUrl.protocol.replace(":", "") : "";

                    it(`Second setOpt params should be equal ${Curl.option.PROXYTYPE} and ${proxyType}`, async () => {

                        expect(opt2).be.equal(Curl.option.PROXYTYPE);
                        expect(value2).be.equal(proxyType);
                    });
                });

                describe("Without protocol ", () => {
                    const proxy = "localhost.com.br/test";
                    const message = "Proxy protocol missing";

                    it(`setProxy should throw exception with message ${message}`, async () => {
                        expect(() => { newRequest("", { proxy })["setProxy"](); }).throw(message);
                    });
                });
            });

            describe("Method setTimeout", () => {
                const timeout = 30000;
                const request = newRequest("", { timeout });

                const setOpt = sinon.spy(request["_curl"], "setOpt");

                request["setTimeout"]();

                const [firstCall] = setOpt.args;
                const [opt1, value1] = firstCall;

                it(`SetOpt params should be equal ${Curl.option.TIMEOUT_MS} and ${timeout}`, async () => {
                    expect(opt1).be.equal(Curl.option.TIMEOUT_MS);
                    expect(value1).be.equal(timeout);
                });
            });

            describe("Method setUrl", () => {

                const request = newRequest();
                const setOpt = sinon.spy(request["_curl"], "setOpt");

                describe("With url", () => {
                    const url = "http://localhost:8000";
                    request["setUrl"](url);

                    const [firstCall] = setOpt.args;
                    const [opt1, value1] = firstCall;

                    it(`SetOpt params should be equal ${Curl.option.URL} and ${url}`, async () => {
                        expect(opt1).be.equal(Curl.option.URL);
                        expect(value1).be.equal(url);
                    });

                });

                describe("With empty url", () => {
                    const messageExpected = "Url missing";

                    it(`setUrl should throw exception with message ${messageExpected}`, async () => {
                        expect(() => { request["setUrl"](""); }).throw(messageExpected);
                    });
                });
            });

            describe("Method setVerbose", () => {
                const verbose = false;
                const request = newRequest("", { verbose });

                const setOpt = sinon.spy(request["_curl"], "setOpt");

                request["setVerbose"]();

                const [firstCall] = setOpt.args;
                const [opt1, value1] = firstCall;

                it(`SetOpt params should be equal ${Curl.option.VERBOSE} and ${verbose}`, async () => {
                    expect(opt1).be.equal(Curl.option.VERBOSE);
                    expect(value1).be.equal(verbose);
                });
            });
        });

        describe("Class Response", () => {

            describe("Method isRedirect", () => {

                describe("Status code 301 - 308", () => {

                    const request = newRequest();
                    sinon.stub(request["_curl"], "getInfo");

                    const codes = [301, 302, 303, 304, 305, 306, 307, 308];

                    for (const code of codes) {
                        describe(`With status code ${code}`, () => {
                            const response = newResponse(request, code, {}, []);

                            it(`should be true`, async () => {
                                expect(true).be.equal(response.isRedirect(code));
                            });

                        });
                    }

                });

                describe("Status code 200 - 208", () => {

                    const request = newRequest();
                    sinon.stub(request["_curl"], "getInfo");

                    const codes = [200, 201, 202];

                    for (const code of codes) {
                        describe(`With status code ${code}`, () => {
                            const response = newResponse(request, code, {}, []);

                            it(`should be true`, async () => {
                                expect(false).be.equal(response.isRedirect(code));
                            });

                        });
                    }

                });
            });

            describe("Method getFuncJson", () => {
                const request = newRequest();
                const code = 200;

                sinon.stub(request["_curl"], "getInfo");

                describe("With body json", () => {

                    const json = JSON.stringify({
                        name: {
                            first: "foo",
                            last: "foo"
                        },
                        email: "foo@foo.com"
                    });

                    const response = newResponse(request, code, json, []);

                    it(`Return should not be {}`, async () => {
                        expect(response.json()).not.be.equal({});
                    });
                });

            });

            describe("Method getFuncText", () => {

                const request = newRequest();
                const code = 200;

                sinon.stub(request["_curl"], "getInfo");

                describe(`With body text plain`, () => {
                    const text = "plain text";
                    const response = newResponse(request, code, text, []);

                    it(`Return should not be ''`, async () => {
                        expect(response.text()).not.be.equal("");
                    });
                });
            });
        });
    });
})();

function newRequest(url?: string, option?: OptionsRequest): Request {

    url = url || "http://localhost/test";
    const options: OptionsRequest = {
        proxy: "http://proxy.com",
        body: {
            name: {
                first: "foo",
                last: "foo"
            },
            email: "foo@foo.com"
        },
        headers: {
            "content-type": "application/json"
        },
        ...option
    };

    return new Request(url, options);
}

function newResponse(request: Request, statusCode: number, body: any, headers: Headers[]): Response {
    return new Response(request, statusCode, body, headers);
}

function getHeaderStringArray(defautHeaders?: HeadersInit): string[] {
    return Object.entries(defautHeaders || {}).map(header => {
        const [key, value] = header;
        return `${key}: ${value}`;
    });
}
