// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'request'.
const request = require('supertest')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'setupRedir... Remove this comment to see the full error message
const setupRedirects = require('../setupRedirects')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('../config')

config.app.supportUrl = '//supportUrl'
config.apis.bookVideoLink.url = '//bvl'

describe('setup redirects', () => {
  let agent
  beforeEach(() => {
    const app = express()
    app.use(setupRedirects())

    agent = request.agent(app)
  })

  it('should redirect to the new bulk appointments service when the old url is used', (done) => {
    agent.get('/add-bulk-appointments').expect('location', '/bulk-appointments/need-to-upload-file').expect(301, done)
  })

  it('should redirect to the new book video link service when the old url is used', (done) => {
    agent.get('/videolink').expect('location', '//bvl').expect(301, done)
  })

  it('should redirect to the new support service when the old support url is used', (done) => {
    agent.get('/content/support').expect('location', '//supportUrl').expect(301, done)
  })

  it('should redirect to the server rendered incentive level page when offenders iep-details url is used', (done) => {
    agent
      .get('/offenders/ABC123/iep-details')
      .expect('location', '/prisoner/ABC123/incentive-level-details')
      .expect(301, done)
  })

  it('should redirect to the server rendered incentive level page when offenders incentive-level-details url is used', (done) => {
    agent
      .get('/offenders/ABC123/incentive-level-details')
      .expect('location', '/prisoner/ABC123/incentive-level-details')
      .expect(301, done)
  })
})
