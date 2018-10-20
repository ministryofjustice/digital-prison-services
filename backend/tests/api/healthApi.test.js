const MockAdapter = require('axios-mock-adapter');
const { expect } = require('chai');
const clientFactory = require('../../api/oauthEnabledClient');
const { healthApiFactory} = require('../../api/healthApi');

describe('healthApi', () => {
  const client1 = clientFactory({});

  const mock1 = new MockAdapter(client1.axiosInstance);

  const healthApi = healthApiFactory(client1);

  afterEach(() => {
    mock1.reset();
  });

  it('should return true if api is up', async () => {
    mock1.onGet('/health').reply(200, {});
    // eslint-disable-next-line
    expect(await healthApi.isUp()).to.be.true;
  });

  it('should return false if api is unreachable', async () => {
    mock1.onGet('/health').networkError();
    // eslint-disable-next-line
    expect(await healthApi.isUp()).to.be.false;
  });

  it('should return false if api times out', async () => {
    mock1.onGet('/health').timeout();
    // eslint-disable-next-line
    expect(await healthApi.isUp()).to.be.false;
  });

  it('should return false if api returns 500', async () => {
    mock1.onGet('/health').reply(500, {});
    // eslint-disable-next-line
    expect(await healthApi.isUp()).to.be.false;
  });
});
