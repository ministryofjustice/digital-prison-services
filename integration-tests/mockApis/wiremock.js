const superagent = require('superagent')

const url = 'http://localhost:9191/__admin'

const stubFor = mapping => superagent.post(`${url}/mappings`).send(mapping)

const getRequests = () => superagent.get(`${url}/requests`)

const resetStubs = () => Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

module.exports = {
  stubFor,
  getRequests,
  resetStubs,
}
