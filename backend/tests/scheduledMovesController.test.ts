import moment from 'moment'
import scheduledMoves from '../controllers/whereabouts/scheduledMoves'

const MOCK_DATE_TO_01_01_2027 = () => jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

const MOCK_DIALOG_DISPLAY_ID = '1234'
jest.mock('uuid', () => ({ v4: () => MOCK_DIALOG_DISPLAY_ID }))

const agencyDetails = { agencyId: 'LEI', description: 'Leeds (HMP)' }
const movementReasons = [
  { code: 'CR', description: 'Conditional Release' },
  { code: 'CA', description: 'Court Appearance' },
  { code: 'CE', description: 'Cond Release Extended Sentence CJA 2003' },
  { code: 'COM', description: 'Committal Hearing' },
  { code: 'CRT', description: 'Court Appearance' },
  { code: 'NOTR', description: 'Normal Transfer' },
]

const courtEvents = [
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
    eventSubType: 'CRT',
    eventStatus: 'SCH',
    judgeName: null,
    directionCode: 'OUT',
    commentText: null,
    bookingActiveFlag: true,
    bookingInOutStatus: 'IN',
  },
]
const transferEvents = [
  {
    offenderNo: 'G5966UI',
    createDateTime: '2021-09-22T10:26:50.745683',
    eventId: 449330572,
    fromAgency: 'MDI',
    fromAgencyDescription: 'Moorland (HMP & YOI)',
    toAgency: 'LEI',
    toAgencyDescription: 'Leeds (HMP)',
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
]
const releaseEvents = [
  {
    offenderNo: 'G3854XD',
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
]
const courtEventsWithoutTransferOnHoldAlerts = [
  {
    offenderNo: 'G1234BB',
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
    eventSubType: 'CRT',
    eventStatus: 'SCH',
    judgeName: null,
    directionCode: 'OUT',
    commentText: null,
    bookingActiveFlag: true,
    bookingInOutStatus: 'IN',
  },
]

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
  {
    alertType: 'T',
    alertCode: 'TSE',
    active: true,
    expired: false,
  },
  {
    alertType: 'T',
    alertCode: 'TAH',
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
    prisonerNumber: 'G3854XD',
    bookingId: 3,
    firstName: 'DAVE',
    lastName: 'SHAVE',
    cellLocation: '1-2-008',
    alerts,
  },
]

const holdAgainstTransferAlertDetailsReponse = [
  {
    alertId: 3,
    bookingId: 42739,
    offenderNo: 'G0204GW',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: 'TAH',
    alertCodeDescription: 'Allocation Hold',
    comment: 'Comment text here',
    dateCreated: '2009-11-24',
    expired: false,
    active: true,
    addedByFirstName: 'ODRAHOON',
    addedByLastName: 'MARSHALD',
    expiredByFirstName: 'ADMIN&ONB',
    expiredByLastName: 'CNOMIS',
  },
  {
    alertId: 1,
    bookingId: 42739,
    offenderNo: 'G0204GW',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: 'TSE',
    alertCodeDescription: 'Security Hold',
    dateCreated: '2009-09-27',
    expired: false,
    active: true,
    addedByFirstName: 'XTAG',
    addedByLastName: 'XTAG',
    expiredByFirstName: 'ADMIN&ONB',
    expiredByLastName: 'CNOMIS',
  },
]

const alertsWithoutHoldOnTransfer = [
  {
    alertType: 'T',
    alertCode: 'HA',
    active: true,
    expired: false,
  },
]

const prisonerSearchResultWithoutHoldOnTransfer = [
  {
    prisonerNumber: 'G1234BB',
    bookingId: 4,
    firstName: 'TIM',
    lastName: 'SMITH',
    cellLocation: '1-2-009',
    alerts: alertsWithoutHoldOnTransfer,
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

const expectReleaseEventsToContain = (res, data) =>
  expect(res.render).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      releaseEvents: expect.arrayContaining([expect.objectContaining(data)]),
    })
  )

const expectTransferEventsToContain = (res, data) =>
  expect(res.render).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      transferEvents: expect.arrayContaining([expect.objectContaining(data)]),
    })
  )

describe('Scheduled moves controller', () => {
  const prisonApi = {
    getMovementReasons: () => {},
    getAgencyDetails: () => {},
    getTransfers: () => {},
    getAlertsForLatestBooking: () => {},
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
    prisonApi.getTransfers = jest.fn().mockResolvedValue({
      courtEvents: [],
      transferEvents: [],
      releaseEvents: [],
    })
    prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue(propertyResponse)
    prisonApi.getAlertsForLatestBooking = jest.fn().mockResolvedValue(holdAgainstTransferAlertDetailsReponse)

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

  it('should render template with the default date and movement reason', async () => {
    req.query.scheduledType = 'A'
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        formValues: {
          date: today,
          scheduledType: 'A',
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

  it('should set show court appearances, transfers and releases to true when the scheduled type is null', async () => {
    req.query.scheduledType = null

    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        showCourtAppearances: true,
        showTransfers: true,
        showReleases: true,
      })
    )
  })

  it('should set show transfers and releases to false', async () => {
    req.query.scheduledType = 'Court'

    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        showCourtAppearances: true,
        showTransfers: false,
        showReleases: false,
      })
    )
  })

  it('should set show court and releases to false', async () => {
    req.query.scheduledType = 'Transfers'

    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        showCourtAppearances: false,
        showTransfers: true,
        showReleases: false,
      })
    )
  })

  it('should set show transfers and court to false', async () => {
    req.query.scheduledType = 'Releases'

    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        showCourtAppearances: false,
        showTransfers: false,
        showReleases: true,
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
          scheduledTypes: [
            {
              text: 'Court',
              value: 'Court',
            },
            {
              text: 'Releases',
              value: 'Releases',
            },
            {
              text: 'Transfers',
              value: 'Transfers',
            },
          ],
        })
      )
    })
  })

  describe('Scheduled movements', () => {
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
      prisonApi.getTransfers = jest.fn().mockResolvedValue({
        courtEvents: [{ offenderNo: 'G4797UD' }],
        transferEvents: [{ offenderNo: 'G5966UI' }],
        releaseEvents: [{ offenderNo: 'G3854XD' }],
      })

      await controller.index(req, res)

      expect(offenderSearchApi.getPrisonersDetails).toHaveBeenLastCalledWith(res.locals, [
        'G4797UD',
        'G5966UI',
        'G3854XD',
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
          releaseEvents: [],
          dateForTitle: '12 October 2021',
          formValues: {
            date: '12/10/2021',
          },
          scheduledTypes: expect.arrayContaining([
            {
              text: 'Court',
              value: 'Court',
            },
          ]),
        })
      )
    })

    it('should handle duplicate offender numbers returned from the transfer request', async () => {
      prisonApi.getTransfers = jest.fn().mockResolvedValue({
        courtEvents: [{ offenderNo: 'A12234' }],
        transferEvents: [{ offenderNo: 'A12234' }],
        releaseEvents: [{ offenderNo: 'A12234' }],
      })
      await controller.index(req, res)

      expect(offenderSearchApi.getPrisonersDetails).toHaveBeenLastCalledWith(res.locals, ['A12234'])
    })

    describe('Court events', () => {
      beforeEach(() => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents,
          transferEvents: [],
          releaseEvents: [],
        })
      })

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
          personalProperty: [
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
          relevantAlertFlagLabels: [
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

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            offenderNo: 'G4797UD',
            sortBy: 'dateCreated',
            sortDirection: 'DESC',
          }
        )
      })

      it('should return hold-against-transfer alert details', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          holdAgainstTransferAlerts: {
            alerts: [
              {
                comments: 'Comment text here',
                createdBy: 'Odrahoon Marshald',
                dateAdded: '24 November 2009',
                description: 'Allocation Hold (TAH)',
              },
              {
                createdBy: 'Xtag Xtag',
                dateAdded: '27 September 2009',
                description: 'Security Hold (TSE)',
              },
            ],
            displayId: MOCK_DIALOG_DISPLAY_ID,
            fullName: 'Bob Cob',
            prisonerNumber: 'G4797UD',
          },
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

      it('should return an empty set when filtering by the incorrect movement reason', async () => {
        req.query.scheduledType = 'A'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [],
          })
        )
      })

      it('should return a single entry for CRT', async () => {
        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [
              {
                cellLocation: '1-2-006',
                destinationLocationDescription: "Aberdeen Sheriff's Court (ABDSHF)",
                name: 'Cob, Bob - G4797UD',
                personalProperty: expect.anything(),
                prisonerNumber: 'G4797UD',
                reasonDescription: 'Court Appearance',
                relevantAlertFlagLabels: expect.anything(),
                holdAgainstTransferAlerts: expect.anything(),
              },
            ],
          })
        )
      })

      it('should not return video link booking appointments', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [{ offenderNo: 'A12234', eventSubType: 'VLC' }],
          transferEvents: [{ offenderNo: 'A12234' }],
          releaseEvents: [{ offenderNo: 'A12234' }],
        })

        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [],
          })
        )
      })
    })

    describe('Release events', () => {
      beforeEach(() => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents,
        })
      })
      it('should format names correctly', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          name: 'Shave, Dave - G3854XD',
        })
      })

      it('should return the cell location', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          cellLocation: '1-2-008',
        })
      })

      it('should return prisoner property', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          personalProperty: [
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

        expectReleaseEventsToContain(res, {
          relevantAlertFlagLabels: [
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

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            offenderNo: 'G4797UD',
            sortBy: 'dateCreated',
            sortDirection: 'DESC',
          }
        )
      })

      it('should return hold-against-transfer alert details', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          holdAgainstTransferAlerts: {
            alerts: [
              {
                comments: 'Comment text here',
                createdBy: 'Odrahoon Marshald',
                dateAdded: '24 November 2009',
                description: 'Allocation Hold (TAH)',
              },
              {
                createdBy: 'Xtag Xtag',
                dateAdded: '27 September 2009',
                description: 'Security Hold (TSE)',
              },
            ],
            displayId: MOCK_DIALOG_DISPLAY_ID,
            fullName: 'Dave Shave',
            prisonerNumber: 'G3854XD',
          },
        })
      })

      it('should return the movement reason description', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          reasonDescription: 'Conditional Release (CJA91) -SH Term>1YR',
        })
      })

      it('should return an empty set when filtering by the incorrect movement reason', async () => {
        req.query.scheduledType = 'A'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [],
          })
        )
      })

      it('should return a single entry for CR', async () => {
        req.query.scheduledType = 'Releases'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [
              {
                cellLocation: '1-2-008',
                name: 'Shave, Dave - G3854XD',
                personalProperty: expect.anything(),
                prisonerNumber: 'G3854XD',
                reasonDescription: 'Conditional Release (CJA91) -SH Term>1YR',
                relevantAlertFlagLabels: expect.anything(),
                holdAgainstTransferAlerts: expect.anything(),
              },
            ],
          })
        )
      })
    })

    describe('Transfer events', () => {
      beforeEach(() => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents,
          releaseEvents: [],
        })
      })
      it('should format names correctly', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          name: 'Shark, Mark - G5966UI',
        })
      })

      it('should return the cell location', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          cellLocation: '1-2-007',
        })
      })

      it('should return prisoner property', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          personalProperty: [
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

        expectTransferEventsToContain(res, {
          relevantAlertFlagLabels: [
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

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            offenderNo: 'G5966UI',
            sortBy: 'dateCreated',
            sortDirection: 'DESC',
          }
        )
      })

      it('should return hold-against-transfer alert details', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          holdAgainstTransferAlerts: {
            alerts: [
              {
                comments: 'Comment text here',
                createdBy: 'Odrahoon Marshald',
                dateAdded: '24 November 2009',
                description: 'Allocation Hold (TAH)',
              },
              {
                createdBy: 'Xtag Xtag',
                dateAdded: '27 September 2009',
                description: 'Security Hold (TSE)',
              },
            ],
            displayId: MOCK_DIALOG_DISPLAY_ID,
            fullName: 'Mark Shark',
            prisonerNumber: 'G5966UI',
          },
        })
      })

      it('should return the movement reason description', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          reasonDescription: 'Normal Transfer',
        })
      })

      it('should return the destination location', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          destinationLocationDescription: 'Leeds (HMP)',
        })
      })

      it('should return an empty set when filtering by the incorrect movement reason', async () => {
        req.query.scheduledType = 'A'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [],
          })
        )
      })

      it('should return a single entry for NOTR', async () => {
        req.query.scheduledType = 'Transfers'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [
              {
                cellLocation: '1-2-007',
                name: 'Shark, Mark - G5966UI',
                personalProperty: expect.anything(),
                prisonerNumber: 'G5966UI',
                reasonDescription: 'Normal Transfer',
                destinationLocationDescription: 'Leeds (HMP)',
                relevantAlertFlagLabels: expect.anything(),
                holdAgainstTransferAlerts: expect.anything(),
              },
            ],
          })
        )
      })

      it('should not return video link booking appointments', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [{ offenderNo: 'A12234' }],
          transferEvents: [{ offenderNo: 'A12234', eventSubType: 'VLC' }],
          releaseEvents: [{ offenderNo: 'A12234' }],
        })

        req.query.scheduledType = 'Transfers'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [],
          })
        )
      })
    })

    describe('Events without hold on transfer alerts', () => {
      beforeEach(() => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: courtEventsWithoutTransferOnHoldAlerts,
          transferEvents: [],
          releaseEvents: [],
        })
        offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue(prisonerSearchResultWithoutHoldOnTransfer)
      })

      it('should not make a call to retrieve hold on transfer details', async () => {
        await controller.index(req, res)

        expect(prisonApi.getAlertsForLatestBooking).not.toHaveBeenCalled()
      })
    })
  })
})
