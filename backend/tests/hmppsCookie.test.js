const request = require('supertest');
const express = require('express');
const setCookie = require('set-cookie-parser');
const cookieParser = require('cookie-parser');
const expect = require('chai').expect;

const hmppsCookie = require('../hmppsCookie');
const contextProperties = require('../contextProperties');

describe('Tests for managing the hmpps cookie.  This controls session lifetime and carries the JWT access and refresh tokens', () => {
  const accessToken = 'aaa';
  const refreshToken = 'bbb';

  it('Should encode and decode the tokens', () => {
    const encodedValue = hmppsCookie.encodeCookieValue(accessToken, refreshToken);
    const decodedValue = hmppsCookie.decodeCookieValue(encodedValue);

    expect(decodedValue.access_token).to.be.equal(accessToken);
    expect(decodedValue.refresh_token).to.be.equal(refreshToken);
  });

  it('Should decode a null cookie value to null', () => {
    // eslint-disable-next-line
    expect(hmppsCookie.decodeCookieValue(null)).to.be.null;
  });

  it('Should decode an undefined cookie value to null', () => {
    // eslint-disable-next-line
    expect(hmppsCookie.decodeCookieValue(undefined)).to.be.null;
  });

  describe('Test the functions returned by the cookieOperations factory', () => {
    const cookieLifetimeInMinutes = 1;
    const domain = '127.0.0.1'; // needs superagent upgrade to 3.1.0 to allow any other domain. (use setHost)

    const cookieOperations = hmppsCookie.cookieOperationsFactory({
      name: 'testCookie',
      cookieLifetimeInMinutes,
      domain,
      secure: false
    });

    const app = express();
    app.use(cookieParser());

    app.get('/setCookie', (req, res) => {
      const context = {};
      contextProperties.setTokens(context, accessToken, refreshToken);
      cookieOperations.setCookie(res, context);
      res.end();
    });

    app.get('/extractCookieValues', (req, res) => {
      const context = {};
      cookieOperations.extractCookieValues(req, context);
      res.json(context);
    });

    app.get('/clearCookie', (req, res) => {
      cookieOperations.clearCookie(res);
      res.end();
    });

    const agent = request.agent(app);

    it('Should set the hmppsCookie correctly', (done) => {
      const expectedCookieValue = hmppsCookie.encodeCookieValue(accessToken, refreshToken);

      agent
        .get('/setCookie')
        .expect(200)
        // eslint-disable-next-line
        .expect((res) => {
          const cookies = setCookie.parse(res);
          expect(cookies).to.have.lengthOf(1);
          const cookie = cookies[0];
          expect(cookie.name).to.be.equal('testCookie');
          expect(cookie.value).to.be.equal(expectedCookieValue);
          expect(cookie.path).to.be.equal('/');
          expect(cookie.domain).to.be.equal(domain);
          // eslint-disable-next-line
          expect(cookie.httpOnly).to.be.true;

          const expires = cookie.expires;
          // eslint-disable-next-line
          expect(expires).to.exist;

          const now = Date.now();

          expect(expires.getTime()).to.be.closeTo(now + (cookieLifetimeInMinutes * 60 * 1000), 1000, 'Expires');
        })
        .end(done);
    });

    it('extractCookieValues', (done) => {
      agent
        .get('/extractCookieValues')
        .expect(200)
        .expect({ accessToken, refreshToken })
        .end(done);
    });

    it('clearCookie', (done) => {
      agent
        .get('/clearCookie')
        .expect(200)
        // eslint-disable-next-line
        .expect((res) => {
          const cookies = setCookie.parse(res);
          expect(cookies).to.have.lengthOf(1);
          const cookie = cookies[0];
          expect(cookie.name).to.be.equal('testCookie');

          // eslint-disable-next-line
          expect(cookie.value).to.be.empty;

          expect(cookie.path).to.equal('/');
          expect(cookie.domain).to.equal(domain);

          // eslint-disable-next-line
          expect(cookie.httpOnly).to.be.true;

          const expires = cookie.expires;

          // eslint-disable-next-line
          expect(expires).to.exist;
          expect(expires.getTime()).to.equal(0);
        })
        .end(done);
    });

    it('extractCookieValues - no values when cookie has been cleared', (done) => {
      agent
        .get('/extractCookieValues')
        .expect(200)
        .expect({ })
        .end(done);
    });
  });
});
