const expect = require('chai').expect;
const decorators = require('../../api/axios-config-decorators');
const contextProperties = require('../../contextProperties');

describe('Axios request configuration decorartor tests', () => {
  it('The authorization decorartor should set the authorization header from the token store', () => {
    const context = {};
    contextProperties.setTokens(context, 'access', 'refresh');

    const configuration = decorators.addAuthorizationHeader(context, {});
    expect(configuration).to.deep.equal(
      {
        headers: {
          authorization: 'Bearer access'
        }
      }
    );
  });
});
