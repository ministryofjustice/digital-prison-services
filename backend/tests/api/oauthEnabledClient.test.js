const MockAdapter = require('axios-mock-adapter');
const expect = require('chai').expect;
const clientFactory = require('../../api/oauthEnabledClient');
const contextProperties = require('../../contextProperties');

describe('Test clients built by oauthEnabledClient', () => {
  it('should build something', () => {
    const client = clientFactory('http://localhost:8080', 2000);
    // eslint-disable-next-line
    expect(client).not.null;
  });

  describe('Assert client behaviour', () => {
    const client = clientFactory('http://localhost:8080', 2000);

    const mock = new MockAdapter(client.axiosInstance);

    beforeEach(() => {
      mock
        .onGet('/api/users/me')
        .reply(200, {});
    });

    afterEach(() => {
      mock.reset();
    });

    it('Should set the authorization header with "Bearer <access token>"', async () => {
      const context = {};
      contextProperties.setTokens(context, 'a', 'b');

      const response = await client.get(context, '/api/users/me');

      expect(response.status).to.equal(200);
      expect(response.config.headers.authorization).to.equal('Bearer a');
    });

    it('Should succeed when there are no authorization headers', async () => {
      const response = await client.get({}, '/api/users/me');
      // eslint-disable-next-line
      expect(response.config.headers.authorization).to.be.undefined;
    });
  });
});
