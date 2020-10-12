const prisonerIncentiveLevelDetails = require('../controllers/prisonerProfile/prisonerIncentiveLevelDetails')

describe('Prisoner incentive level details', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const elite2Api = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
    }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    elite2Api.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    elite2Api.getIepSummaryForBooking = jest.fn().mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })
    elite2Api.getAgencyDetails = jest
      .fn()
      .mockReturnValueOnce({
        agencyId: 'HEI',
        description: 'Hewell',
      })
      .mockReturnValueOnce({
        agencyId: 'LEI',
        description: 'Leeds',
      })
    elite2Api.getStaffDetails = jest.fn().mockReturnValue({
      username: 'ITAG_USER',
      firstName: 'Staff',
      lastName: 'Member',
    })

    controller = prisonerIncentiveLevelDetails({ elite2Api, logError })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getIepSummaryForBooking).toHaveBeenCalledWith(res.locals, bookingId, true)
  })

  it('Should render the correct template with the correct data', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerIncentiveLevelDetails.njk', {
      breadcrumbPrisonerName: 'Smith, John',
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      dpsUrl: 'http://localhost:3000/',
      errors: [],
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15 August 2018',
      establishments: [{ value: 'HEI', text: 'Hewell' }, { value: 'LEI', text: 'Leeds' }],
      formValues: {},
      levels: [
        {
          text: 'Basic',
          value: 'Basic',
        },
        {
          text: 'Enhanced',
          value: 'Enhanced',
        },
        {
          text: 'Standard',
          value: 'Standard',
        },
      ],
      prisonerName: 'John Smith',
      profileUrl: '/prisoner/ABC123',
      results: [
        {
          agencyId: 'LEI',
          bookingId: -1,
          formattedTime: '15 August 2017 - 16:04',
          iepDate: '2017-08-15',
          iepEstablishment: 'Leeds',
          iepLevel: 'Standard',
          iepStaffMember: 'Staff Member',
          iepTime: '2017-08-15T16:04:35',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          formattedTime: '10 August 2017 - 16:04',
          iepEstablishment: 'Hewell',
          iepStaffMember: 'Staff Member',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          agencyId: 'HEI',
          bookingId: -1,
          formattedTime: '7 August 2017 - 16:04',
          iepDate: '2017-08-07',
          iepEstablishment: 'Hewell',
          iepLevel: 'Enhanced',
          iepStaffMember: 'Staff Member',
          iepTime: '2017-08-07T16:04:35',
          userId: 'ITAG_USER',
        },
      ],
    })
  })

  it('Should filter by level', async () => {
    req.query = { incentiveLevel: 'Basic' }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        formValues: {
          incentiveLevel: 'Basic',
        },
        results: [
          {
            bookingId: -1,
            iepDate: '2017-08-10',
            iepTime: '2017-08-10T16:04:35',
            formattedTime: '10 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Basic',
            userId: 'ITAG_USER',
          },
        ],
      })
    )
  })

  it('Should filter by date', async () => {
    req.query = { fromDate: '10/08/2017', toDate: '11/08/2017' }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        formValues: {
          fromDate: '10/08/2017',
          toDate: '11/08/2017',
        },
        results: [
          {
            bookingId: -1,
            iepDate: '2017-08-10',
            iepTime: '2017-08-10T16:04:35',
            formattedTime: '10 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Basic',
            userId: 'ITAG_USER',
          },
        ],
      })
    )
  })

  it('Should filter by agency/establishment', async () => {
    req.query = { agencyId: 'HEI' }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        formValues: {
          agencyId: 'HEI',
        },
        results: [
          {
            bookingId: -1,
            iepDate: '2017-08-10',
            iepTime: '2017-08-10T16:04:35',
            formattedTime: '10 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Basic',
            userId: 'ITAG_USER',
          },
          {
            bookingId: -1,
            iepDate: '2017-08-07',
            iepTime: '2017-08-07T16:04:35',
            formattedTime: '7 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Enhanced',
            userId: 'ITAG_USER',
          },
        ],
      })
    )
  })

  it('Should filter by all filters', async () => {
    req.query = {
      agencyId: 'HEI',
      level: 'Basic',
      fromDate: '10/08/2017',
      toDate: '11/08/2017',
    }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        formValues: {
          agencyId: 'HEI',
          level: 'Basic',
          fromDate: '10/08/2017',
          toDate: '11/08/2017',
        },
        results: [
          {
            bookingId: -1,
            iepDate: '2017-08-10',
            iepTime: '2017-08-10T16:04:35',
            formattedTime: '10 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Basic',
            userId: 'ITAG_USER',
          },
        ],
      })
    )
  })

  it('Should return records if same From and To dates', async () => {
    req.query = { fromDate: '10/08/2017', toDate: '10/08/2017' }

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        formValues: {
          fromDate: '10/08/2017',
          toDate: '10/08/2017',
        },
        results: [
          {
            bookingId: -1,
            iepDate: '2017-08-10',
            iepTime: '2017-08-10T16:04:35',
            formattedTime: '10 August 2017 - 16:04',
            iepEstablishment: 'Hewell',
            iepStaffMember: 'Staff Member',
            agencyId: 'HEI',
            iepLevel: 'Basic',
            userId: 'ITAG_USER',
          },
        ],
      })
    )
  })
})
