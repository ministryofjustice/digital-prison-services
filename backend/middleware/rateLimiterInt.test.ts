import request from 'supertest'
import express from 'express'

import requestLimiter from './requestLimiter'

const app = express()

app.get('/hello', requestLimiter({ maxConnections: 2 }), (req, res) => res.status(200).end())

describe('Request rate limiter', () => {
  it('responds with json', async () => {
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
