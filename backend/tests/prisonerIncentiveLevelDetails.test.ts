import type apis from '../apis'
import prisonerIncentiveLevelDetails from '../controllers/prisonerProfile/prisonerIncentiveLevelDetails'

describe('Prisoner incentive level details', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>
  const oauthApi = {}

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
    res = { locals: { user: { allCaseloads: [] } }, render: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest
      .fn()
      .mockResolvedValue({ agencyId: 'MDI', bookingId, firstName: 'John', lastName: 'Smith' })

    incentivesApi.getIepSummaryForBooking = jest.fn().mockReturnValue({
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest
      .fn()
      .mockReturnValueOnce({
        agencyId: 'HEI',
        description: 'Hewell',
      })
      .mockReturnValueOnce({
        agencyId: 'LEI',
        description: 'Leeds',
      })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getStaffDetails = jest.fn().mockReturnValue({
      username: 'ITAG_USER',
      firstName: 'Staff',
      lastName: 'Member',
    })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockReturnValue([])

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; oauthApi: {}; l... Remove this comment to see the full error message
    controller = prisonerIncentiveLevelDetails({ prisonApi, incentivesApi, oauthApi, logError })
  })

  it('should make the expected API calls', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(incentivesApi.getIepSummaryForBooking).toHaveBeenCalledWith(res.locals, bookingId, true)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    expect(oauthApi.userRoles).toHaveBeenCalledWith(res.locals)
  })

  it('Should render the correct template with the correct data', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerIncentiveLevelDetails.njk', {
      breadcrumbPrisonerName: 'Smith, John',
      currentIepLevel: 'Standard',
      daysOnIepLevel: '1 year, 260 days',
      errors: [],
      currentIepDateTime: '2017-08-15T16:04:35',
      nextReviewDate: '15 August 2018',
      establishments: [
        { value: 'HEI', text: 'Hewell' },
        { value: 'LEI', text: 'Leeds' },
      ],
      formValues: {},
      noResultsFoundMessage: '',
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
      offenderNo,
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
      userCanUpdateIEP: false,
    })
  })

  it('should allow user to update iep if user is in case load and has correct role', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles.mockReturnValue([{ roleCode: 'GLOBAL_SEARCH' }, { roleCode: 'MAINTAIN_IEP' }])
    res.locals.user.allCaseloads = [{ caseLoadId: 'MDI', description: 'Moorland' }]
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        userCanUpdateIEP: true,
      })
    )
  })

  it('should NOT allow user to update iep if user is NOT in case load but has correct role', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles.mockReturnValue([{ roleCode: 'GLOBAL_SEARCH' }, { roleCode: 'MAINTAIN_IEP' }])
    res.locals.user.allCaseloads = [{ caseLoadId: 'LEI', description: 'Leeds' }]
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        userCanUpdateIEP: false,
      })
    )
  })

  it('should NOT allow user to update iep if user is in case load but does NOT have correct role', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles.mockReturnValue([{ roleCode: 'GLOBAL_SEARCH' }])
    res.locals.user.allCaseloads = [{ caseLoadId: 'MDI', description: 'Moorland' }]
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        userCanUpdateIEP: false,
      })
    )
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

  it('should return default message for no incentive level history', async () => {
    req.query = {}

    incentivesApi.getIepSummaryForBooking = jest.fn().mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [],
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        noResultsFoundMessage: 'John Smith has no incentive level history',
        results: [],
      })
    )
  })

  it('should return default message when no incentive level history is returned for the supplied filters', async () => {
    req.query = { fromDate: '10/08/2017', toDate: '10/08/2017' }

    incentivesApi.getIepSummaryForBooking = jest.fn().mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [],
    })

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerIncentiveLevelDetails.njk',
      expect.objectContaining({
        noResultsFoundMessage: 'There is no incentive level history for the selections you have made',
        results: [],
      })
    )
  })
})
