const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const { resetAuthStubs } = require('../mockApis/wiremock/auth')
const { resetEliteStubs } = require('../mockApis/wiremock/elite2')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetAuthStubs(), resetEliteStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({}), elite2api.stubUser(), elite2api.stubUserCaseloads()]),
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt({}), elite2api.stubUser(), elite2api.stubUserCaseloads()]),
  })
}
