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

const stubGlobalSearchPage = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/dpshomepage/global-search`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>New global search</h1></body></html>',
    },
  })

const stubGlobalSearchResultsPage = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/dpshomepage/global-search/results`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>New global search results</h1></body></html>',
    },
  })

const stubPrisonerSearchPage = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `/dpshomepage/prisoner-search`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body><h1>New prisoner search</h1></body></html>',
    },
  })

module.exports = {
  stubDpsHomepage,
  stubGlobalSearchPage,
  stubGlobalSearchResultsPage,
  stubPrisonerSearchPage,
}
