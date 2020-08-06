Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const viewNonAssociations = require('../../controllers/cellMove/viewNonAssociations')
const { serviceUnavailableMessage } = require('../../common-messages')

describe('view non associations', () => {
  let req
  let res
  let logError
  let controller

  const elite2Api = {}

  const tomorrow = moment().add(1, 'days')

  const offenderNo = 'ABC123'

  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
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
    elite2Api.getNonAssociations = jest.fn().mockResolvedValue({
      offenderNo: 'ABC123',
      firstName: 'Fred',
      lastName: 'Bloggs',
      agencyDescription: 'Moorland (HMP & YOI)',
      assignedLivingUnitDescription: 'MDI-1-1-3',
      nonAssociations: [
        {
          reasonCode: 'VIC',
          reasonDescription: 'Victim',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: '2020-12-01T13:34:00',
          authorisedBy: 'string',
          comments: 'Test comment 1',
          offenderNonAssociation: {
            offenderNo: 'ABC124',
            firstName: 'Joseph',
            lastName: 'Bloggs',
            reasonCode: 'PER',
            reasonDescription: 'Perpetrator',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-3',
          },
        },
        {
          reasonCode: 'RIV',
          reasonDescription: 'Rival gang',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: '2019-12-01T13:34:00',
          expiryDate: tomorrow,
          authorisedBy: 'string',
          comments: 'Test comment 2',
          offenderNonAssociation: {
            offenderNo: 'ABC125',
            firstName: 'Jim',
            lastName: 'Bloggs',
            reasonCode: 'RIV',
            reasonDescription: 'Rival gang',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-3',
          },
        },
        {
          reasonCode: 'VIC',
          reasonDescription: 'Victim',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: '2018-12-01T13:34:00',
          expiryDate: '2019-12-01T13:34:00',
          authorisedBy: 'string',
          comments: 'Test comment 3',
          offenderNonAssociation: {
            offenderNo: 'ABC125',
            firstName: 'Jim',
            lastName: 'Bloggs',
            reasonCode: 'PER',
            reasonDescription: 'Perpetrator',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-2-1-3',
          },
        },
      ],
    })

    controller = viewNonAssociations({ elite2Api, logError })
  })

  it('Makes the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getNonAssociations).toHaveBeenCalledWith(res.locals, 1234)
  })

  it('Should render error template when there is an API error', async () => {
    elite2Api.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    await controller(req, res)

    expect(logError).toHaveBeenCalledWith(req.originalUrl, new Error('Network error'), serviceUnavailableMessage)
    expect(res.render).toHaveBeenCalledWith('error.njk', {
      url: '/prisoner/ABC123/cell-move/non-associations',
      homeUrl: '/prisoner/ABC123',
    })
  })

  it('populates the data correctly when no non-associations and no assessments', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/nonAssociations.njk',
      expect.objectContaining({
        nonAssociationsRows: [
          {
            comment: 'Test comment 2',
            effectiveDate: '1 December 2019',
            location: 'MDI-2-1-3',
            name: 'Jim Bloggs',
            otherOffenderKey: 'Jim Bloggs is',
            otherOffenderRole: 'Rival gang',
            prisonNumber: 'ABC125',
            selectedOffenderKey: 'Test User is',
            selectedOffenderRole: 'Rival gang',
            type: 'Do Not Locate on Same Wing',
          },
          {
            comment: 'Test comment 1',
            effectiveDate: '1 December 2020',
            location: 'MDI-2-1-3',
            name: 'Joseph Bloggs',
            otherOffenderKey: 'Joseph Bloggs is',
            otherOffenderRole: 'Perpetrator',
            prisonNumber: 'ABC124',
            selectedOffenderKey: 'Test User is',
            selectedOffenderRole: 'Victim',
            type: 'Do Not Locate on Same Wing',
          },
        ],
        prisonerName: 'Test User',
        selectLocationLink: '/prisoner/ABC123/cell-move/select-location',
        breadcrumbPrisonerName: 'User, Test',
        dpsUrl: 'http://localhost:3000/',
      })
    )
  })
})
