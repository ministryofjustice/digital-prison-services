import request from 'supertest'
import express from 'express'

import requestLimiter from './requestLimiter'

const app = express()

const setDefaultUsername = (req, res, next) => {
  req.session = { userDetails: { username: 'test' } }
  return next()
}

app.get('/hello', setDefaultUsername, requestLimiter(2), (req, res) => res.status(200).end())

describe('Request rate limiter', () => {
  it.skip('responds with json', async () => {
    await request(app).get('/hello').expect(200)
    await request(app).get('/hello').expect(200)
    await request(app)
      .get('/hello')
      .expect(429)
      .then((response) => {
        expect(response.text).toEqual('Too many requests, please try again later.')
      })
  })
})
