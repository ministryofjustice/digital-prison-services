import moment from 'moment'
import scheduledMoves from '../controllers/whereabouts/scheduledMoves'

const MOCK_DATE_TO_01_01_2027 = () => jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

const agencyDetails = { agencyId: 'LEI', description: 'Leeds (HMP)' }
const movementReasons = [
  {
    domain: 'MOVE_RSN',
    code: 'C9',
    description: 'Attend Religious Service',
    parentCode: 'TAP',
    activeFlag: 'Y',
    listSeq: 109,
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    domain: 'MOVE_RSN',
    code: 'CA',
    description: 'Court Appearance',
    parentDomain: 'MOVE_TYPE',
    parentCode: 'CRT',
    activeFlag: 'N',
    listSeq: 32,
    systemDataFlag: 'Y',
    expiredDate: '2009-05-23',
    subCodes: [],
  },
  {
    domain: 'MOVE_RSN',
    code: 'CE',
    description: 'Cond Release Extended Sentence CJA 2003',
    parentDomain: 'MOVE_TYPE',
    parentCode: 'CRT',
    activeFlag: 'Y',
    listSeq: 32,
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    domain: 'MOVE_RSN',
    code: 'COM',
    description: 'Committal Hearing',
    parentDomain: 'MOVE_TYPE',
    parentCode: 'CRT',
    activeFlag: 'Y',
    listSeq: 999,
    systemDataFlag: 'Y',
    subCodes: [],
  },
  {
    domain: 'MOVE_RSN',
    code: 'CRT',
    description: 'Court Appearance',
    parentDomain: 'MOVE_TYPE',
    parentCode: 'CRT',
    activeFlag: 'Y',
    listSeq: 32,
    systemDataFlag: 'Y',
    subCodes: [],
  },
]

const transferResponse = {
  courtEvents: [
    {
      offenderNo: 'G4797UD',
      createDateTime: '2021-09-24T09:22:21.350125',
      eventId: 449548211,
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP & YOI)',
      toAgency: 'ABDSUM',
      toAgencyDescription: "Aberdeen Sheriff's Court (ABDSHF)",
      eventDate: '2021-09-29',
      startTime: '2021-09-29T21:00:00',
      endTime: null,
      eventClass: 'EXT_MOV',
      eventType: 'CRT',
      eventSubType: '19',
      eventStatus: 'SCH',
      judgeName: null,
      directionCode: 'OUT',
      commentText: null,
      bookingActiveFlag: true,
      bookingInOutStatus: 'IN',
    },
  ],
  transferEvents: [
    {
      offenderNo: 'G5966UI',
      createDateTime: '2021-09-22T10:26:50.745683',
      eventId: 449330572,
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP & YOI)',
      toAgency: 'LEI',
      toAgencyDescription: 'LEEDS (HMP)',
      toCity: null,
      eventStatus: 'SCH',
      eventClass: 'EXT_MOV',
      eventType: 'TRN',
      eventSubType: 'NOTR',
      eventDate: '2021-09-29',
      startTime: '2021-09-29T10:00:00',
      endTime: null,
      outcomeReasonCode: null,
      judgeName: null,
      engagementCode: null,
      escortCode: 'GEOAME',
      performanceCode: null,
      directionCode: 'OUT',
      bookingActiveFlag: true,
      bookingInOutStatus: 'IN',
    },
  ],
  releaseEvents: [
    {
      offenderNo: 'G3854UD',
      createDateTime: '2016-11-07T15:13:59.268001',
      eventId: 320696788,
      fromAgency: 'MDI',
      fromAgencyDescription: 'Moorland (HMP & YOI)',
      releaseDate: '2021-09-29',
      approvedReleaseDate: null,
      eventClass: 'EXT_MOV',
      eventStatus: 'SCH',
      movementTypeCode: 'REL',
      movementTypeDescription: 'Release',
      movementReasonCode: 'CR',
      movementReasonDescription: 'Conditional Release (CJA91) -SH Term>1YR',
      commentText: null,
      bookingActiveFlag: true,
      bookingInOutStatus: 'OUT',
    },
  ],
  movements: [],
}

const alerts = [
  {
    alertType: 'T',
    alertCode: 'HA',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'HA1',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'XCU',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'XHT',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'PEEP',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'XRF',
    active: true,
    expired: false,
  },
]

const prisonerSearchResult = [
  {
    prisonerNumber: 'G4797UD',
    bookingId: 1,
    firstName: 'BOB',
    lastName: 'COB',
    cellLocation: '1-2-006',
    alerts,
  },
  {
    prisonerNumber: 'G5966UI',
    bookingId: 2,
    firstName: 'MARK',
    lastName: 'SHARK',
    cellLocation: '1-2-007',
    alerts,
  },
  {
    prisonerNumber: 'G3854UD',
    bookingId: 3,
    firstName: 'DAVE',
    lastName: 'SHAVE',
    cellLocation: '1-2-008',
    alerts,
  },
]

const propertyResponse = [
  {
    location: {
      locationId: 26169,
      locationType: 'BOX',
      description: 'PROP_BOXES-PB014',
      agencyId: 'MDI',
      parentLocationId: 26155,
      currentOccupancy: 0,
      locationPrefix: 'MDI-PROP_BOXES-PB014',
      userDescription: 'Property Box 14',
      internalLocationCode: 'PB014',
    },
    sealMark: 'MDA646165646',
    containerType: 'Valuables',
  },
  {
    location: {
      locationId: 26170,
      locationType: 'BOX',
      description: 'PROP_BOXES-PB015',
      agencyId: 'MDI',
      parentLocationId: 26155,
      currentOccupancy: 0,
      locationPrefix: 'MDI-PROP_BOXES-PB015',
      userDescription: 'Property Box 15',
      internalLocationCode: 'PB015',
    },
    containerType: 'Confiscated',
  },
]

const expectCourtEventsToContain = (res, data) =>
  expect(res.render).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      courtEvents: expect.arrayContaining([expect.objectContaining(data)]),
    })
  )

describe('Scheduled moves controller', () => {
  const prisonApi = {
    getMovementReasons: () => {},
    getAgencyDetails: () => {},
    getTransfers: () => {},
    getPrisonerProperty: () => {},
  }
  const offenderSearchApi = {
    getPrisonersDetails: () => {},
  }
  let controller
  let req
  let res
  let today

  beforeEach(() => {
    res = {
      render: jest.fn(),
      locals: {},
    }
    req = {
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
      query: {},
    }
    MOCK_DATE_TO_01_01_2027()

    today = moment().format('DD/MM/YYYY')
    prisonApi.getMovementReasons = jest.fn().mockResolvedValue(movementReasons)
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetails)
    prisonApi.getTransfers = jest.fn().mockResolvedValue(transferResponse)
    prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue(propertyResponse)

    offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue(prisonerSearchResult)

    controller = scheduledMoves({ prisonApi, offenderSearchApi })
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339)
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  it('renders the correct template', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith('whereabouts/scheduledMoves.njk', expect.anything())
  })

  it('should render template with the default date', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        formValues: {
          date: today,
        },
      })
    )
  })

  it('should make a call to retrieve current agency details', async () => {
    await controller.index(req, res)

    expect(prisonApi.getAgencyDetails).toHaveBeenLastCalledWith(res.locals, 'LEI')
  })
  it('should render template with the agency description and formatted date ', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        dateForTitle: '1 January 2017',
        agencyDescription: 'Leeds (HMP)',
      })
    )
  })

  describe('Movement reason select values', () => {
    it('should make a call for to retrieve the movement reasons', async () => {
      await controller.index(req, res)

      expect(prisonApi.getMovementReasons).toHaveBeenLastCalledWith(res.locals)
    })

    it('should map the movement reason values into the right shape for the select box, sorted alphabetically ', async () => {
      await controller.index(req, res)

      expect(res.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          movementReasons: [
            { text: 'Attend Religious Service', value: 'C9' },
            {
              text: 'Committal Hearing',
              value: 'COM',
            },
            { text: 'Cond Release Extended Sentence CJA 2003', value: 'CE' },
            {
              text: 'Court Appearance',
              value: 'CA',
            },
            { text: 'Court Appearance', value: 'CRT' },
          ],
        })
      )
    })
  })

  describe('Transfers', () => {
    beforeEach(() => {
      req.query = { date: '12/10/2021' }
    })
    it('should make a call to retrieve all transfer with the correct parameters', async () => {
      await controller.index(req, res)

      expect(prisonApi.getTransfers).toHaveBeenCalledWith(res.locals, {
        fromDateTime: '2021-10-12T00:00:00',
        toDateTime: '2021-10-12T23:59:59',
        agencyId: 'LEI',
        courtEvents: true,
        transferEvents: true,
        releaseEvents: true,
      })
    })

    it('should make a call to retrieve booking ids for each prisoner returned by the transfer request', async () => {
      await controller.index(req, res)

      expect(offenderSearchApi.getPrisonersDetails).toHaveBeenLastCalledWith(res.locals, [
        'G4797UD',
        'G5966UI',
        'G3854UD',
      ])
    })

    it('should make a call to retrieve prisoners property for each prisoner returned by the transfer request', async () => {
      await controller.index(req, res)

      expect(prisonApi.getPrisonerProperty).not.toHaveBeenLastCalledWith([
        [{}, 1],
        [{}, 2],
        [{}, 3],
      ])
    })

    it('should return early when there are no transfer events for the given date', async () => {
      prisonApi.getTransfers = jest.fn().mockResolvedValue({
        courtEvents: [],
        transferEvents: [],
        releaseEvents: [],
      })
      await controller.index(req, res)

      expect(offenderSearchApi.getPrisonersDetails).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          agencyDescription: 'Leeds (HMP)',
          courtEvents: [],
          dateForTitle: '12 October 2021',
          formValues: {
            date: '12/10/2021',
          },
          movementReasons: expect.arrayContaining([
            {
              text: 'Attend Religious Service',
              value: 'C9',
            },
          ]),
        })
      )
    })

    describe('Court events', () => {
      it('should format names correctly', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          name: 'Cob, Bob - G4797UD',
        })
      })

      it('should return the cell location', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          cellLocation: '1-2-006',
        })
      })

      it('should return prisoner property', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          prisonerProperty: [
            {
              containerType: 'Valuables',
              boxNumber: 'Box 14',
            },
            {
              containerType: 'Confiscated',
              boxNumber: 'Box 15',
            },
          ],
        })
      })

      it('should return only relevant alerts', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          relevantAlerts: [
            {
              classes: 'alert-status alert-status--acct',
              img: null,
              label: 'ACCT open',
            },
            {
              classes: 'alert-status alert-status--acct-post-closure',
              img: null,
              label: 'ACCT post closure',
            },
            {
              classes: 'alert-status alert-status--controlled-unlock',
              img: null,
              label: 'Controlled unlock',
            },
            {
              classes: 'alert-status alert-status--hostage-taker',
              img: null,
              label: 'Hostage taker',
            },
            {
              classes: 'alert-status alert-status--disability',
              img: '/images/Disability_icon.png',
              label: 'PEEP',
            },
            { classes: 'alert-status alert-status--risk-females', img: null, label: 'Risk to females' },
          ],
        })
      })

      it('should return the movement reason description', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          reasonDescription: 'Court Appearance',
        })
      })

      it('should return the destination location', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          destinationLocationDescription: "Aberdeen Sheriff's Court (ABDSHF)",
        })
      })
    })
  })
})
