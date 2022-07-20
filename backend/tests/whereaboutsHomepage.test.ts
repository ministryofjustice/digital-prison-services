import supertest from 'supertest'
import express from 'express'
import { whereaboutsTasks } from '../controllers/whereabouts/homePage'
import whereaboutsHomepage from '../routes/whereabouts/whereaboutsRouter'
import nunjucksSetup from '../utils/nunjucksSetup'

describe('Homepage', () => {
  const oauthApi = {
    userRoles: jest.fn(),
  }
  const prisonApi = {
    getStaffRoles: jest.fn(),
  }
  const offenderSearchApi = {}

  let req
  let res
  beforeEach(() => {
    req = {
      session: {
        userDetails: {
          staffId: 1,
          activeCaseLoadId: 'MDI',
        },
      },
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    prisonApi.getStaffRoles = jest.fn().mockResolvedValue([])
    oauthApi.userRoles = jest.fn().mockReturnValue([])
  })

  const app = express()
  nunjucksSetup(app)
  app.use((request, response, next) => {
    res.render = jest.spyOn(response, 'render')
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in req) {
      request[key] = req[key]
    }
    next()
  })

  app.use('/', whereaboutsHomepage({ prisonApi, oauthApi, offenderSearchApi, systemOauthClient: {} }))

  const getTasks = (excluding: string[] = []) =>
    whereaboutsTasks.filter(({ id }) => !excluding.includes(id)).map(({ enabled, ...rest }) => rest)

  describe('Tasks', () => {
    it('should render template with correct non role specific tasks', () => {
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(() => {
          expect(res.render).toHaveBeenCalledWith(
            'whereabouts/whereaboutsHomepage.njk',
            expect.objectContaining({
              tasks: getTasks(['view-bulk-appointments', 'view-covid-units']),
            })
          )
        })
    })

    it('should render template with bulk appointments task', () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'BULK_APPOINTMENTS' }])
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(() => {
          expect(res.render).toHaveBeenCalledWith(
            'whereabouts/whereaboutsHomepage.njk',
            expect.objectContaining({
              tasks: getTasks(['view-covid-units']),
            })
          )
        })
    })

    it('should render template with covid units task', () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'PRISON' }])
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(() => {
          expect(res.render).toHaveBeenCalledWith(
            'whereabouts/whereaboutsHomepage.njk',
            expect.objectContaining({
              tasks: getTasks(['view-bulk-appointments']),
            })
          )
        })
    })

    it('should render template with all tasks', () => {
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'PRISON' }, { roleCode: 'BULK_APPOINTMENTS' }])
      return supertest(app)
        .get('/')
        .expect(200)
        .expect(() => {
          expect(res.render).toHaveBeenCalledWith(
            'whereabouts/whereaboutsHomepage.njk',
            expect.objectContaining({
              tasks: getTasks(),
            })
          )
        })
    })
  })
})
