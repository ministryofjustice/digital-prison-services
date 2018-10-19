const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const setCookie = require('set-cookie-parser');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const sessionManagementRoutes = require('../sessionManagementRoutes');
const hmppsCookie = require('../hmppsCookie');
const contextProperties = require('../contextProperties');

const hmppsCookieName = 'testCookie';

const accessToken = 'AT';
const refreshToken = 'RT';

describe('Test the routes and middleware installed by sessionManagementRoutes', () => {
  const app = express();

  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  const hmppsCookieOperations = hmppsCookie.cookieOperationsFactory({
    name: hmppsCookieName,
    cookieLifetimeInMinutes: 1,
    domain: '127.0.0.1',
    secure: false
  });

  const setTokensOnContext = (context) => new Promise((resolve) => {
    contextProperties.setTokens(context, accessToken, refreshToken);
    resolve();
  });

  const rejectWithStatus = rejectStatus => () => Promise.reject({ response: { status: rejectStatus } });
  const rejectWithAuthenticationError = errorText => () => Promise.reject({ response: { data: { error_description: errorText }, status: 401 } });

  const oauthApi = {
    authenticate: setTokensOnContext,
    refresh: () => Promise.resolve()
  };

  const healthApi = {
    isUp: () => Promise.resolve(true)
  };

  /**
   * A Token refresher that does nothing.
   * @returns {Promise<void>}
   */
  const tokenRefresher = sinon.stub();

  sessionManagementRoutes.configureRoutes({
    app,
    healthApi,
    oauthApi,
    hmppsCookieOperations,
    tokenRefresher,
    mailTo: 'test@site.com'
  });

  // some content to send for '/'
  app.get('/', (req, res) => {
    res.send('static');
  });

  // Create an agent.  The agent handles and sends cookies. (It has state). The order of test below is important
  // because the outcome of each test depends upon the successful completion of the previous tests.
  const agent = request.agent(app);

  const callback = done => function (err, res) {
    if (err) {
      if (done.fail) {
        // jest
        done.fail(err);
      } else {
        // mocha
        done(err);
      }
    } else {
      done();
    }
  };

  it('GET "/" with no cookie (not authenticated) redirects to /auth/login', (done) => {
    tokenRefresher.resolves();

    agent
      .get('/')
      .expect(302)
      .expect('location', '/auth/login')
      .end(callback(done));
  });

  it('GET "/auth/login" when not authenticated returns login page', (done) => {
    agent
      .get('/auth/login')
      .expect(200)
      .expect('content-type', /text\/html/)
      .expect(/Login/)
      .end(callback(done));
  });

  it('successful login redirects to "/" setting hmpps cookie', (done) => {
    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(302)
      .expect('location', '/')
      .expect(hasCookies(['testCookie']))
      .end(callback(done));
  });

  it('GET "/auth/login" when  authenticated redirects to "/"', (done) => {
    agent
      .get('/auth/login')
      .expect(302)
      .expect('location', '/')
      .end(callback(done));
  });

  it('GET "/" with cookie serves content', (done) => {
    agent
      .get('/')
      .expect(200)
      .expect('static')
      .expect(hasCookies(['testCookie']))
      .end(callback(done));
  });

  it('GET "/heart-beat"', (done) => {
    agent
      .get('/heart-beat')
      .expect(200)
      .expect(hasCookies(['testCookie']))
      .expect(() => {
        // eslint-disable-next-line
        expect(tokenRefresher).to.be.called
      })
      .end(callback(done));
  });

  it('GET "/heart-beat" when refresh fails', (done) => {
    tokenRefresher.rejects();

    agent
      .get('/heart-beat')
      .expect(500)
      .expect(() => {
        // eslint-disable-next-line
        expect(tokenRefresher).to.be.called
      })
      .end(callback(done));
  });


  it('GET "/auth/logout" clears the cookie', (done) => {
    const newNomisEndpointUrl = 'https://newnomis.url';
    process.env.NN_ENDPOINT_URL = newNomisEndpointUrl;
    tokenRefresher.resolves();

    agent
      .get('/auth/logout')
      .expect(302)
      .expect('location', `${newNomisEndpointUrl}/auth/login`)
      // The server sends a set cookie header to clear the cookie.
      // The next test shows that the cookie was cleared because of the redirect to '/'
      .expect(hasCookies(['testCookie']))
      .end(callback(done));
  });

  it('After logout get "/" should redirect to "/auth/login"', (done) => {
    agent
      .get('/')
      .expect(302)
      .expect('location', '/auth/login')
      .expect(hasCookies([]))
      .end(callback(done));
  });

  it('Unsuccessful signin - API up', (done) => {
    oauthApi.authenticate = rejectWithStatus(401);

    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(401)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login');
        expect(res.text).to.include('The username or password you have entered is invalid.');
      })
      .end(callback(done));
  });

  it('Unsuccessful signin - API up, locked account', (done) => {
    oauthApi.authenticate = rejectWithAuthenticationError('ORA-28000');

    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(401)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login');
        expect(res.text).to.include('Your user account is locked.');
      })
      .end(callback(done));
  });

  it('Unsuccessful signin - API up, expired account', (done) => {
    oauthApi.authenticate = rejectWithAuthenticationError('ORA-28001');

    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(401)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login');
        expect(res.text).to.include('Your password has expired.');
      })
      .end(callback(done));
  });

  it('Unsuccessful signin - API down', (done) => {
    oauthApi.authenticate = rejectWithStatus(503);

    agent
      .post('/auth/login')
      .send('username=test&password=testPassowrd')
      .expect(503)
      .expect(res => {
        expect(res.error.path).to.equal('/auth/login');
        expect(res.text).to.include('Service unavailable. Please try again later.');
      })
      .end(callback(done));
  });
});

const hasCookies = expectedNames => res => {
  const cookieNames = setCookie.parse(res).map(cookie => cookie.name);
  expect(cookieNames).to.have.members(expectedNames);
};
