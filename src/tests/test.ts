import * as chai from 'chai';

import fetch from '../index';

import { Server } from './server';

const expect = chai.expect;

(async () => {
    describe('Server', () => {
        it('Server shoud be Start With Success', async () => {
            const result = await Server.start();
            expect(result).be.equal('success');
        });
    });

    describe('Requests GET', () => {
        it('Status Code shoud be 200', async () => {
            const resGetSuccess = await getSuccess();
            expect(resGetSuccess.status).be.equal(200);
        });

        const follow = 5;
        it(`Max redirect shoud be ${follow}`, async () => {
            const resPostRedirect = await getRedirect(follow, 'follow');
            expect(resPostRedirect.countRedirect).be.equal(5);
        });

        it(`Redirect error shoud throw error`, async () => {
            expect(() => { getRedirect(follow, 'error'); }).to.throw;
        });

        it(`Redirect manual shoud return status code 3xx`, async () => {
            const resPostRedirect = await getRedirect(follow, 'manual');
            expect(resPostRedirect.status).be.greaterThan(300).lessThan(309);
        });

        it('Url empty should throw error', async () => {
            expect(() => { fetch(''); }).to.throw('Url missing');
        });

        it('Method Http node defined should be GET', async () => {
            const resGetSuccess = await getSuccess();
            const body = resGetSuccess.json();
            expect(body.method).be.equal('GET');
        });

    }).timeout(5000);

    describe('Requests POST', () => {
        it('Status Code shoud be 200', async () => {
            const resPostSuccess = await postSuccess();
            expect(resPostSuccess.status).be.equal(200);
        });

    }).timeout(5000);

})();

async function getSuccess() {
    return await fetch('http://localhost:8000/test/get/ok');
}

async function getRedirect(follow: number, redirect: RequestRedirect) {
    return await fetch(`http://localhost:8000/test/get/redirect?maxRedirects=${follow}`, {
        method: 'GET',
        redirect: redirect,
        follow: follow,
        version: 1,
        body: {
            name: 'foo',
            email: 'foo@foo.com.br'
        },
        headers: {
            'content-type': 'aplication/json'
        }
    });
}

async function postSuccess() {
    return await fetch('http://localhost:8000/test/post/ok', {
        method: 'POST',
        body: {
            name: 'foo',
            email: 'foo@foo.com.br'
        },
        headers: {
            'content-type': 'aplication/application/x-www-form-urlencoded'
        }
    });
}