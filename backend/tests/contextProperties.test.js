const expect = require('chai').expect;
const contextProperties = require('../contextProperties');

describe('Should read/write properties', () => {
  it('Should set / get tokens', () => {
    const context = {};
    contextProperties.setTokens(context, 'a', 'b');
    expect(contextProperties.getAccessToken(context)).to.be.equal('a');
    expect(contextProperties.getRefreshToken(context)).to.be.equal('b');
  });

  it('Should return null if tokens not present', () => {
    const context = {};
    // eslint-disable-next-line
    expect(contextProperties.getAccessToken(context)).to.be.null;
    // eslint-disable-next-line
    expect(contextProperties.getRefreshToken(context)).to.be.null;
  });

  it('Should know if the context has no tokens', () => {
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(null)).to.be.false;
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(undefined)).to.be.false;
    // eslint-disable-next-line
    expect(contextProperties.hasTokens({})).to.be.false;
  });

  it('Should know if the context has tokens', () => {
    const context = {};
    contextProperties.setTokens(context, null, null);
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(context)).to.be.false;

    contextProperties.setTokens(context, '', '');
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(context)).to.be.false;

    contextProperties.setTokens(context, 'a', '');
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(context)).to.be.false;

    contextProperties.setTokens(context, '', 'b');
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(context)).to.be.false;

    contextProperties.setTokens(context, 'a', 'b');
    // eslint-disable-next-line
    expect(contextProperties.hasTokens(context)).to.be.true;
  });
});
