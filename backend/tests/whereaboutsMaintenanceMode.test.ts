import supertest from 'supertest'
import express from 'express'
import nunjucksSetup from '../utils/nunjucksSetup'
import routes from '../routes'

jest.mock('../raiseAnalyticsEvent', () => jest.fn())

describe('Whereabouts maintenance mode flag is true', () => {
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

  app.use(
    routes({
      prisonApi: '',
      whereaboutsApi: '',
      oauthApi: '',
      communityApi: '',
      dataComplianceApi: '',
      keyworkerApi: '',
      caseNotesApi: '',
      allocationManagerApi: '',
      pathfinderApi: '',
      socApi: '',
      offenderSearchApi: '',
      complexityApi: '',
      curiousApi: '',
      incentivesApi: '',
      restrictedPatientApi: '',
      whereaboutsMaintenanceMode: true,
    })
  )

  it('should display maintenance page when user navigates to /manage-prisoner-whereabouts', () => {
    return supertest(app)
      .get('/manage-prisoner-whereabouts')
      .expect(200)
      .expect(() => {
        expect(res.render).toHaveBeenCalledWith(
          'maintenancePage.njk',
          expect.objectContaining({
            title: 'Manage prisoner whereabouts',
          })
        )
      })
  })

  it('should display maintenance page when user navigates to /manage-prisoner-whereabouts/attendance-reason-statistics', () => {
    return supertest(app)
      .get('/manage-prisoner-whereabouts/attendance-reason-statistics')
      .expect(200)
      .expect(() => {
        expect(res.render).toHaveBeenCalledWith(
          'maintenancePage.njk',
          expect.objectContaining({
            title: 'Manage prisoner whereabouts',
          })
        )
      })
  })

  it('should display maintenance page when user navigates to /offenders/:offenderNo/add-appointment', () => {
    return supertest(app)
      .get('/offenders/ABC123/add-appointment')
      .expect(200)
      .expect(() => {
        expect(res.render).toHaveBeenCalledWith(
          'maintenancePage.njk',
          expect.objectContaining({
            title: 'Appointment details',
          })
        )
      })
  })

  it('should display maintenance page when user navigates to /offenders/:offenderNo/prepost-appointments', () => {
    return supertest(app)
      .get('/offenders/ABC123/prepost-appointments')
      .expect(200)
      .expect(() => {
        expect(res.render).toHaveBeenCalledWith(
          'maintenancePage.njk',
          expect.objectContaining({
            title: 'Appointment details',
          })
        )
      })
  })

  it('should display maintenance page when user navigates to /appointment-details/:id/confirm-deletion', () => {
    return supertest(app)
      .get('/appointment-details/123/confirm-deletion')
      .expect(200)
      .expect(() => {
        expect(res.render).toHaveBeenCalledWith(
          'maintenancePage.njk',
          expect.objectContaining({
            title: 'Appointment details',
          })
        )
      })
  })
})
