import * as chai from "chai";

import fetch, { Curl } from "../../src/index";

import { Server } from "./server";

const expect = chai.expect;
const portHttp1 = process.env.SERVER_PORT;
const portHttp2 = parseInt(process.env.SERVER_PORT) + 1;

(async () => {
  describe("API Tests", () => {

    describe("Server", () => {

      describe("When start server HTTP1", () => {
        it("Shoud be Start With Success", async () => {
          const resultHttp1 = await Server.http1();
          expect(resultHttp1).be.equal("success");
        });
      });

      describe("When start server HTTP2", () => {
        it("Shoud be Start With Success", async () => {
          const resultHttp2 = await Server.http2();
          expect(resultHttp2).be.equal("success");
        });
      });
    });

    describe("GET", () => {

      describe("When request valid url", () => {
        it("Status Code shoud be 200", async () => {
          const resGetSuccess = await getSuccess();
          expect(resGetSuccess.status).be.equal(200);
        });
      });

      describe("When request valid url", () => {
        it("Status Code shoud be 200", async () => {
          const resGetSuccess = await getSuccessHttp2();
          expect(resGetSuccess.status).be.equal(200);
        });
      }).timeout(5000);

      describe("Redirect", () => {
        const follow = 5;

        describe(`When param folow is equal ${follow}`, () => {
          it(`Total redirect shoud be ${follow}`, async () => {
            const resPostRedirect = await getRedirect(follow, "follow");
            expect(resPostRedirect.countRedirect).be.equal(5);
          });
        });

        describe(`When param redirect is equal error`, () => {
          it(`Request should throw error in redirect`, async () => {
            expect(() => {
              getRedirect(follow, "error");
            }).to.throw;
          });
        });

        describe(`When param redirect is equal manual`, () => {
          it(`Request should return status code 3xx`, async () => {
            const resPostRedirect = await getRedirect(follow, "manual");
            expect(resPostRedirect.status)
              .be.greaterThan(300)
              .lessThan(309);
          });
        });
      });

      describe(`When url is empty`, () => {
        it("Request should throw error", async () => {
          expect(() => {
            fetch("");
          }).to.throw("Url missing");
        });
      });

      describe(`When method is Http empty`, () => {
        it("Derault method should be GET", async () => {
          const resGetSuccess = await getSuccess();
          const body = resGetSuccess.json();
          expect(body.method).be.equal("GET");
        });
      });
    }).timeout(5000);

    describe("Requests POST", () => {
      it("Status Code shoud be 200", async () => {
        const resPostSuccess = await postSuccess();
        expect(resPostSuccess.status).be.equal(200);
      });
    }).timeout(5000);
  }).timeout(5000);
})();

async function getSuccess() {
  return await fetch(`http://localhost:${portHttp1}/test/get/ok`);
}

async function getRedirect(follow: number, redirect: RequestRedirect) {
  return await fetch(
    `http://localhost:${portHttp1}/test/get/redirect?maxRedirects=${follow}`,
    {
      method: "GET",
      redirect: redirect,
      follow: follow,
      version: 1,
      body: {
        name: "foo",
        email: "foo@foo.com.br"
      },
      headers: {
        "content-type": "aplication/json"
      }
    }
  );
}

async function postSuccess() {
  return await fetch(`http://localhost:${portHttp1}/test/post/ok`, {
    method: "POST",
    body: {
      name: "foo",
      email: "foo@foo.com.br"
    },
    headers: {
      "content-type": "aplication/application/x-www-form-urlencoded"
    }
  });
}

async function getSuccessHttp2() {
  return await fetch(`https://localhost:${portHttp2}/test/get/ok`, {
    method: "GET",
    curl: {
      opts: {
        [Curl.option.SSL_VERIFYPEER]: false
      }
    }
  });
}