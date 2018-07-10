Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const authentication = require('../controllers/authentication');
const elite2Api = require('../elite2Api');
const session = require('../session');
const health = require('../controllers/health');

const req = {
  headers: {},
  query: {}
};

const res = {
  render: jest.fn(),
  redirect: jest.fn()
};


describe('Authentication', async () => {
  it('Should map correct login error on authentication failure - expired', async () => {
    elite2Api.login = jest.fn();
    session.setHmppsCookie = jest.fn();
    health.healthResult = jest.fn();

    elite2Api.login.mockImplementation(() => {
      let error = new Error('error object');
      error.response = createLoginFailureExpiredResponse();
      throw error;
    });
    health.healthResult.mockImplementationOnce(() => createHealthyResponse());

    await authentication.postLogin(req, res);

    expect(elite2Api.login.mock.calls.length).toBe(1);
    expect(res.render).toBeCalledWith("login", expect.objectContaining({
      apiUp: true,
      authError: true,
      authErrorText: "Your password has expired."
    }));
  });

  it('Should map correct login error on authentication failure - locked', async () => {
    elite2Api.login = jest.fn();
    session.setHmppsCookie = jest.fn();
    health.healthResult = jest.fn();

    elite2Api.login.mockImplementation(() => {
      let error = new Error('error object');
      error.response = createLoginFailureLockedResponse();
      throw error;
    });
    health.healthResult.mockImplementationOnce(() => createHealthyResponse());

    await authentication.postLogin(req, res);

    expect(elite2Api.login.mock.calls.length).toBe(1);
    expect(res.render).toBeCalledWith("login", expect.objectContaining({
      apiUp: true,
      authError: true,
      authErrorText: "Your user account is locked."
    }));
  });

  it('Should map correct login error on authentication failure - missing NWEB', async () => {
    elite2Api.login = jest.fn();
    session.setHmppsCookie = jest.fn();
    health.healthResult = jest.fn();

    elite2Api.login.mockImplementation(() => {
      let error = new Error('error object');
      error.response = createLoginFailureNWEBResponse();
      throw error;
    });
    health.healthResult.mockImplementationOnce(() => createHealthyResponse());

    await authentication.postLogin(req, res);

    expect(elite2Api.login.mock.calls.length).toBe(1);
    expect(res.render).toBeCalledWith("login", expect.objectContaining({
      apiUp: true,
      authError: true,
      authErrorText: "You are not enabled for this service, please contact admin and request access."
    }));
  });

  it('Should display service not available if healthcheck fails', async () => {
    elite2Api.login = jest.fn();
    session.setHmppsCookie = jest.fn();
    health.healthResult = jest.fn();

    elite2Api.login.mockImplementation(() => {
      let error = new Error('error object');
      error.response = createLoginFailureExpiredResponse();
      throw error;
    });

    health.healthResult.mockImplementationOnce(() => createUnHealthyResponse());

    await authentication.postLogin(req, res);

    expect(res.render).toBeCalledWith("login", expect.objectContaining({
      apiUp: false
    }));
  });

  it('Should display default login message if error response not recognised', async () => {
    elite2Api.login = jest.fn();
    session.setHmppsCookie = jest.fn();
    health.healthResult = jest.fn();

    elite2Api.login.mockImplementation(() => {
      let error = new Error('error object');
      error.response = createUnknownLoginFailureResponse();
      throw error;
    });
    health.healthResult.mockImplementationOnce(() => createHealthyResponse());

    await authentication.postLogin(req, res);

    expect(elite2Api.login.mock.calls.length).toBe(1);
    expect(res.render).toBeCalledWith("login", expect.objectContaining({
      apiUp: true,
      authError: true,
      authErrorText: "The username or password you have entered is invalid."
    }));
  });
});

function createLoginFailureLockedResponse () {
  return {
    data: {
      error: "invalid_grant",
      error_description: "ORA-28000: account is locked"
    }
  };
}

function createLoginFailureExpiredResponse () {
  return {
    data: {
      error: "invalid_grant",
      error_description: "ORA-28001: the password has expired"
    }
  };
}

function createLoginFailureNWEBResponse () {
  return {
    data: {
      error: "something",
      error_description: "does not have access to caseload NWEB"
    }
  };
}

function createUnknownLoginFailureResponse () {
  return {
  };
}

function createHealthyResponse () {
  return {
    status: 200,
    api: {
      elite2Api: {
        status: "UP",
        healthInfo: {
          status: "UP",
          version: "2018-07-09.2737"
        },
        diskSpace: {
          status: "UP",
          total: 29137096704,
          free: 19576590336,
          threshold: 10485760
        },
        db: {
          status: "UP",
          database: "Oracle",
          hello: "Hello"
        }
      }
    } };
}

function createUnHealthyResponse () {
  return {
    status: 500,
    healthInfo: {
      status: "DOWN",
      version: "version not available"
    },
    diskSpace: {
      status: "UP",
      total: 510923390976,
      free: 143828922368,
      threshold: 10485760
    },
    db: {
      status: "DOWN"
    }
  };
}
