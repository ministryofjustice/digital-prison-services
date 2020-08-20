Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const selectLocation = require('../../controllers/cellMove/selectLocation')
const { serviceUnavailableMessage } = require('../../common-messages')

describe('select location', () => {
  let req
  let res
  let logError
  let controller

  const elite2Api = {}

  const whereaboutsApi = {}

  const offenderNo = 'ABC123'

  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
    csra: 'High',
    assessments: [],
    assignedLivingUnit: {},
    alerts: [
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XC',
        alertCodeDescription: 'Risk to females',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo,
      },
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'XGANG',
        alertCodeDescription: 'Gang member',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Security',
        bookingId: 14,
        comment: 'has a large poster on cell wall',
        dateCreated: '2019-08-20',
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo,
      },
    ],
  }

  beforeEach(() => {
    logError = jest.fn()

    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn() }

    elite2Api.getDetails = jest.fn().mockResolvedValue(getDetailsResponse)
    elite2Api.getNonAssociations = jest.fn().mockResolvedValue({ nonAssociations: [] })
    elite2Api.getCellAttributes = jest.fn().mockResolvedValue([])

    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([])

    controller = selectLocation({ elite2Api, whereaboutsApi, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(elite2Api.getNonAssociations).toHaveBeenCalledWith(res.locals, 1234)
  })

  it('Should render error template when there is an API error', async () => {
    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/prisoner/ABC123/cell-move/select-location',
      homeUrl: '/prisoner/ABC123',
    })
  })

  describe('Header data', () => {
    it('populates the data correctly when no non-associations and no assessments', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          prisonerDetails: getDetailsResponse,
          breadcrumbPrisonerName: 'User, Test',
          showNonAssociationsLink: false,
          showCsraLink: false,
          alerts: [{ alertCodes: ['XGANG'], classes: 'alert-status alert-status--gang-member', label: 'Gang member' }],
          offenderNo,
        })
      )
    })

    it('populates the data correctly when some non-associations, but not in the same establishment', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assignedLivingUnit: {
          agencyName: 'Moorland',
        },
      })
      elite2Api.getNonAssociations = jest.fn().mockResolvedValue({
        nonAssociations: [
          {
            offenderNonAssociation: {
              agencyDescription: 'LEEDS',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations, but not effective yet', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assignedLivingUnit: {
          agencyName: 'Moorland',
        },
      })
      elite2Api.getNonAssociations = jest.fn().mockResolvedValue({
        nonAssociations: [
          {
            effectiveDate: moment().add(1, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations, but expired', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assignedLivingUnit: {
          agencyName: 'Moorland',
        },
      })
      elite2Api.getNonAssociations = jest.fn().mockResolvedValue({
        nonAssociations: [
          {
            effectiveDate: moment().subtract(10, 'days'),
            expiryDate: moment().subtract(1, 'days'),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showNonAssociationsLink: false,
        })
      )
    })

    it('populates the data correctly when some non-associations in the same establishment', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assignedLivingUnit: {
          agencyName: 'Moorland',
        },
      })
      elite2Api.getNonAssociations = jest.fn().mockResolvedValue({
        nonAssociations: [
          {
            effectiveDate: moment(),
            offenderNonAssociation: {
              agencyDescription: 'MOORLAND',
            },
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showNonAssociationsLink: true,
        })
      )
    })

    it('populates the data correctly when CSR Rating assessment does not have a comment', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assessments: [
          {
            assessmentCode: 'CSR',
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showCsraLink: false,
        })
      )
    })

    it('populates the data correctly when CSR Rating assessment has a comment', async () => {
      elite2Api.getDetails = jest.fn().mockResolvedValue({
        ...getDetailsResponse,
        assessments: [
          {
            assessmentCode: 'CSR',
            assessmentComment: 'Test comment',
          },
        ],
      })
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'cellMove/selectLocation.njk',
        expect.objectContaining({
          showCsraLink: true,
        })
      )
    })
  })
})
