const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: () => Promise.all([auth.stubLogin({}), elite2api.stubUser(), elite2api.stubUserCaseloads()]),
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt({}), elite2api.stubUser(), elite2api.stubUserCaseloads()]),
  })
}
