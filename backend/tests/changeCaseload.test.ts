import { Response } from 'express'
import { changeCaseloadFactory } from '../controllers/changeCaseload'

describe('index', () => {
  const prisonApi = {}
  let mockRes: Partial<Response>
  const logError = jest.fn()

  let service

  beforeEach(() => {
    mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          allCaseloads: [
            {
              caseLoadId: 'LEI',
              description: 'Leeds (HMP)',
              type: 'INST',
              currentlyActive: true,
            },
            {
              caseLoadId: 'HEI',
              description: 'Hewell (HMP)',
              type: 'INST',
              currentlyActive: false,
            },
          ],
        },
      },
      status: jest.fn(),
    }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.userCaseLoads = jest.fn()
    service = changeCaseloadFactory(prisonApi, logError)
  })

  it('should render the change caseload page with correct data', async () => {
    const req = {
      headers: { referer: 'http://localhost:3000/pshUrl/' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
    }
    const res = { ...mockRes }

    await service.index(req, res)

    expect(res.render).toBeCalledWith('changeCaseload.njk', {
      title: 'Change your location',
      options: [
        { value: 'LEI', text: 'Leeds (HMP)' },
        { value: 'HEI', text: 'Hewell (HMP)' },
      ],
      backUrl: 'http://localhost:3000/pshUrl/',
    })
  })

  it.each([undefined, 'http://localhost/change-caseload', 'http://localhost/change-caseload/'])(
    'shouldnt provide a back link if the referrer is undefined or the change-caseload page itself',
    async (referer) => {
      const req = {
        headers: { referer },
        session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
      }
      const res = { ...mockRes }

      await service.index(req, res)

      expect(res.render).toBeCalledWith('changeCaseload.njk', {
        title: 'Change your location',
        options: [
          { value: 'LEI', text: 'Leeds (HMP)' },
          { value: 'HEI', text: 'Hewell (HMP)' },
        ],
      })
    }
  )

  it('should redirect back to homepage if user has less than 2 caseloads', async () => {
    const req = {
      headers: { referer: 'http://localhost:3000/newNomisEndpoint' },
      session: { userDetails: { name: 'Test User', activeCaseLoadId: 'LEI' } },
    }
    const res = {
      ...mockRes,
      locals: {
        user: {
          allCaseloads: [
            {
              caseLoadId: 'LEI',
              description: 'Leeds (HMP)',
              type: 'INST',
              currentlyActive: true,
            },
          ],
        },
      },
    }

    await service.index(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })
})

describe('post', () => {
  const prisonApi = {}
  const req = {
    session: {
      userDetails: {},
      data: {
        activeCaseLoadId: 'LEI',
      },
    },
  }
  const res = {
    redirect: jest.fn(),
    render: jest.fn(),
  }

  const logError = jest.fn()

  let service

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setActiveCaseload' does not exist on typ... Remove this comment to see the full error message
    prisonApi.setActiveCaseload = jest.fn()
  })

  it('should call the API with the correct body', async () => {
    service = changeCaseloadFactory(prisonApi, logError)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'setActiveCaseload' does not exist on typ... Remove this comment to see the full error message
    expect(prisonApi.setActiveCaseload).toHaveBeenCalledWith(res.locals, { caseLoadId: 'MDI' })
  })

  it('should redirect on success', async () => {
    service = changeCaseloadFactory(prisonApi, logError)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('should update session with new caseload id and clear app session data', async () => {
    service = changeCaseloadFactory(prisonApi, logError)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
    req.body = { caseLoadId: 'MDI' }

    await service.post(req, res)

    expect(req.session.data).toBe(null)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'activeCaseLoadId' does not exist on type... Remove this comment to see the full error message
    expect(req.session.userDetails.activeCaseLoadId).toBe('MDI')
  })

  it('should error when caseload id is missing', async () => {
    service = changeCaseloadFactory(prisonApi, logError)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
    req.body = {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ redire... Remove this comment to see the full error message
    res.status = jest.fn()

    await service.post(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ redire... Remove this comment to see the full error message
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.render).toBeCalledWith('error.njk', {
      url: '/change-caseload',
    })
  })
})
