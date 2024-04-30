const { stubFor } = require('./wiremock')

const stubDpsHomepage = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: '/dpshomepage/',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>DPS Home page</h1></body></html>',
    },
  })

module.exports = {
  stubDpsHomepage,
}
