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
  {
    offenderNo: 'G5966UT',
    createDateTime: '2021-09-22T11:26:50.745683',
    eventId: 449330573,
    fromAgency: 'MDI',
    fromAgencyDescription: 'Moorland (HMP & YOI)',
    toAgency: 'LEI',
    toAgencyDescription: 'Leeds (HMP)',
    toCity: null,
    eventStatus: 'SCH',
    eventClass: 'EXT_MOV',
    eventType: 'TAP',
    eventSubType: 'NOTR',
    eventDate: '2021-09-29',
    startTime: '2021-09-29T11:00:00',
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
const courtEventsWithOnlyInactiveTransferOnHoldAlerts = [
  {
    offenderNo: 'G1234CC',
    createDateTime: '2021-09-24T09:22:21.350125',
    eventId: 449548212,
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
    status: 'ACTIVE IN',
    alerts,
  },
  {
    prisonerNumber: 'G5966UI',
    bookingId: 2,
    firstName: 'MARK',
    lastName: 'SHARK',
    cellLocation: '1-2-007',
    status: 'ACTIVE IN',
    alerts,
  },
  {
    prisonerNumber: 'G3854XD',
    bookingId: 3,
    firstName: 'DAVE',
    lastName: 'SHAVE',
    cellLocation: '1-2-008',
    status: 'ACTIVE IN',
    alerts,
  },
  {
    prisonerNumber: 'G123456',
    bookingId: 3,
    firstName: 'D',
    lastName: 'S',
    cellLocation: 'CSWAP',
    status: 'ACTIVE IN',
    alerts: [],
  },
  {
    prisonerNumber: 'A112233',
    bookingId: 4,
    firstName: 'FREE',
    lastName: 'PERSON',
    status: 'ACTIVE IN',
    alerts,
  },
]

const holdAgainstTransferAlertDetailsResponse = [
  {
    alertId: 3,
    bookingId: 42739,
    prisonNumber: 'G0204GW',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: { code: 'TAH', description: 'Allocation Hold' },
    description: 'Comment text here',
    createdAt: '2009-11-24',
    expired: false,
    isActive: true,
    createdByDisplayName: 'Odrahoon Marshald',
    expiredByFirstName: 'ADMIN&ONB',
    expiredByLastName: 'CNOMIS',
  },
  {
    alertId: 2,
    bookingId: 42739,
    prisonNumber: 'G0204GW',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: { code: 'TCPA', description: 'Security Hold' },
    createdAt: '2009-08-27',
    expired: true,
    isActive: false,
    createdByDisplayName: 'Xtag Xtag',
    expiredByFirstName: 'ADMIN&ONB',
    expiredByLastName: 'CNOMIS',
  },
  {
    alertId: 1,
    bookingId: 42739,
    prisonNumber: 'G0204GW',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: { code: 'TSE', description: 'Security Hold' },
    createdAt: '2009-09-27',
    expired: false,
    isActive: true,
    createdByDisplayName: 'Xtag Xtag',
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
    status: 'ACTIVE IN',
    alerts: alertsWithoutHoldOnTransfer,
  },
]

const alertsWithInactiveHoldOnTransfer = [
  {
    alertType: 'T',
    alertCode: 'TAH',
    active: false,
    expired: true,
  },
]

const prisonerSearchResultWithOnlyInactiveHoldOnTransfer = [
  {
    prisonerNumber: 'G1234CC',
    bookingId: 5,
    firstName: 'DAN',
    lastName: 'SMITT',
    cellLocation: '1-2-010',
    alerts: alertsWithInactiveHoldOnTransfer,
    status: 'ACTIVE IN',
  },
]

const holdAgainstTransferWithOnlyInactiveAlertDetailsResponse = [
  {
    alertId: 1,
    bookingId: 42739,
    offenderNo: 'G1234CC',
    alertType: 'T',
    alertTypeDescription: 'Hold Against Transfer',
    alertCode: 'TAH',
    alertCodeDescription: 'Allocation Hold',
    comment: 'Comment text here',
    dateCreated: '2009-11-24',
    expired: true,
    active: false,
    addedByFirstName: 'ODRAHOON',
    addedByLastName: 'MARSHALD',
    expiredByFirstName: 'ADMIN&ONB',
    expiredByLastName: 'CNOMIS',
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
    getPrisonerProperty: () => {},
  }
  const offenderSearchApi = {
    getPrisonersDetails: () => {},
  }
  const systemOauthClient = {
    getClientCredentialsTokens: () => ({}),
  }
  const prisonerAlertsApi = {
    getAlertsForLatestBooking: jest.fn(),
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
    prisonerAlertsApi.getAlertsForLatestBooking = jest
      .fn()
      .mockResolvedValue({ content: holdAgainstTransferAlertDetailsResponse })

    offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue(prisonerSearchResult)

    controller = scheduledMoves({ prisonApi, offenderSearchApi, systemOauthClient, prisonerAlertsApi })
  })

  afterEach(() => {
    const spy = jest.spyOn(Date, 'now')
    spy.mockRestore()
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
              text: 'Court appearances',
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
              text: 'Court appearances',
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

    describe('Ignore prisoners that are outside', () => {
      const assertOnlyRequestAdditionalDataForPrisonersInPrison = () => {
        expect(prisonApi.getPrisonerProperty).toHaveBeenCalledTimes(1)
        expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalledTimes(1)
        expect(prisonApi.getPrisonerProperty).toHaveBeenCalledWith(res.locals, 1)
        expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          expect.objectContaining({
            prisonNumber: 'A12345',
          })
        )
      }

      beforeEach(() => {
        offenderSearchApi.getPrisonersDetails = jest.fn().mockResolvedValue([
          {
            prisonerNumber: 'A12345',
            bookingId: 1,
            status: 'ACTIVE IN',
            firstName: 'firstName1',
            lastName: 'lastName1',
            alerts: [{ alertType: 'T', alertTypeDescription: 'Hold Against Transfer', alertCode: 'TAH' }],
          },
          {
            prisonerNumber: 'A12346',
            status: 'ACTIVE OUT',
            firstName: 'firstName2',
            lastName: 'lastName2',
            alert: [],
          },
        ])
      })

      describe('Court events', () => {
        beforeEach(() => {
          prisonApi.getTransfers = jest.fn().mockResolvedValue({
            courtEvents: [
              { offenderNo: 'A12345', eventStatus: 'SCH' },
              { offenderNo: 'A12346', eventStatus: 'SCH' },
            ],
            releaseEvents: [],
            transferEvents: [],
          })
        })

        it('should return only one court event', async () => {
          await controller.index(req, res)

          expect(res.render).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
              courtEvents: [
                expect.objectContaining({
                  cellLocation: 'None',
                  name: 'Lastname1, Firstname1 - A12345',
                  prisonerNumber: 'A12345',
                }),
              ],
            })
          )
        })

        it('only enhance court events for prisoners actively inside', async () => {
          await controller.index(req, res)

          assertOnlyRequestAdditionalDataForPrisonersInPrison()
        })
      })

      describe('Transfer events', () => {
        beforeEach(() => {
          prisonApi.getTransfers = jest.fn().mockResolvedValue({
            courtEvents: [],
            releaseEvents: [],
            transferEvents: [
              { offenderNo: 'A12345', eventStatus: 'SCH' },
              { offenderNo: 'A12346', eventStatus: 'SCH' },
            ],
          })
        })

        it('should return only one transfer event', async () => {
          await controller.index(req, res)

          expect(res.render).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
              transferEvents: [
                expect.objectContaining({
                  cellLocation: 'None',
                  name: 'Lastname1, Firstname1 - A12345',
                  prisonerNumber: 'A12345',
                }),
              ],
            })
          )
        })
        it('only enhance transfer events for prisoners actively inside', async () => {
          await controller.index(req, res)

          assertOnlyRequestAdditionalDataForPrisonersInPrison()
        })
      })

      describe('Release events', () => {
        beforeEach(() => {
          prisonApi.getTransfers = jest.fn().mockResolvedValue({
            courtEvents: [],
            releaseEvents: [
              { offenderNo: 'A12345', eventStatus: 'SCH' },
              { offenderNo: 'A12346', eventStatus: 'SCH' },
            ],
            transferEvents: [],
          })
        })

        it('should return only one release event', async () => {
          await controller.index(req, res)

          expect(res.render).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
              releaseEvents: [
                expect.objectContaining({
                  cellLocation: 'None',
                  name: 'Lastname1, Firstname1 - A12345',
                  prisonerNumber: 'A12345',
                }),
              ],
            })
          )
        })
        it('only enhance release events for prisoners actively inside', async () => {
          await controller.index(req, res)

          assertOnlyRequestAdditionalDataForPrisonersInPrison()
        })
      })
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

      it('should handle situation with no property', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([])

        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          personalProperty: [],
        })
      })

      it('should handle situation with no property user description', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([
          {
            location: {
              locationId: 26169,
              locationType: 'BOX',
              description: 'PROP_BOXES-PB014',
              agencyId: 'MDI',
              parentLocationId: 26155,
              currentOccupancy: 0,
              locationPrefix: 'MDI-PROP_BOXES-PB014',
              internalLocationCode: 'PB014',
            },
            sealMark: 'MDA646165646',
            containerType: 'Valuables',
          },
        ])

        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          personalProperty: [{ boxNumber: 'None', containerType: 'Valuables' }],
        })
      })

      it('should return only relevant alerts', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          relevantAlertFlagLabels: [
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT open',
            },
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT post closure',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Controlled unlock',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Hostage taker',
            },
            {
              classes: 'alert-status alert-status--medical',
              label: 'PEEP',
            },
            { classes: 'alert-status alert-status--security', label: 'Risk to females' },
          ],
        })
      })

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            prisonNumber: 'G4797UD',
            sortBy: 'createdAt',
            sortDirection: 'desc',
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

      it('should replace CSWAP with the correct content for the cell location', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [{ offenderNo: 'G123456', eventSubType: 'CRT', eventStatus: 'SCH' }],
          transferEvents: [],
          releaseEvents: [],
        })

        req.query.scheduledType = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [
              expect.objectContaining({
                cellLocation: 'No cell allocated',
                prisonerNumber: 'G123456',
              }),
            ],
          })
        )
      })

      it('should apply default sort on surname', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [
            { offenderNo: 'G4797UD', eventSubType: 'CRT', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI', eventSubType: 'CRT', eventStatus: 'SCH' },
            { offenderNo: 'G3854XD', eventSubType: 'CRT', eventStatus: 'SCH' },
          ],
          transferEvents: [],
          releaseEvents: [],
        })

        req.query.scheduledType = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
              }),
              expect.objectContaining({
                name: 'Shark, Mark - G5966UI',
              }),
              expect.objectContaining({
                name: 'Shave, Dave - G3854XD',
              }),
            ],
          })
        )
      })

      it('should only show scheduled court events', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [
            { offenderNo: 'G4797UD', eventSubType: 'CRT', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI', eventSubType: 'CRT' },
            { offenderNo: 'G3854XD', eventSubType: 'CRT' },
          ],
          transferEvents: [],
          releaseEvents: [],
        })

        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            courtEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
                prisonerNumber: 'G4797UD',
                reasonDescription: 'Court Appearance',
              }),
            ],
          })
        )
      })

      it('should return a count of unique prisoners scheduled to attend court', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [
            { offenderNo: 'A12234', eventSubType: 'CTR', eventStatus: 'SCH' },
            { offenderNo: 'A12234', eventSubType: 'CTR', eventStatus: 'SCH' },
          ],
          transferEvents: [],
          releaseEvents: [],
        })

        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            prisonersListedForCourt: 1,
          })
        )
      })

      it('should return a count of unique prisoners scheduled to be released', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents: [
            { offenderNo: 'A12234', eventSubType: 'CR', eventStatus: 'SCH' },
            { offenderNo: 'A12234', eventSubType: 'CR', eventStatus: 'SCH' },
          ],
        })

        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            prisonersListedForRelease: 1,
          })
        )
      })

      it('should return a count of unique prisoners scheduled to be transferred', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [
            { offenderNo: 'A12234', eventSubType: 'NTOR', eventStatus: 'SCH' },
            { offenderNo: 'A12234', eventSubType: 'NTOR', eventStatus: 'SCH' },
          ],
          releaseEvents: [],
        })

        req.query.movementReason = 'Court'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            prisonersListedForTransfer: 1,
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

      it('should handle situation with no property', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([])

        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          personalProperty: [],
        })
      })

      it('should return only relevant alerts', async () => {
        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          relevantAlertFlagLabels: [
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT open',
            },
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT post closure',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Controlled unlock',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Hostage taker',
            },
            {
              classes: 'alert-status alert-status--medical',
              label: 'PEEP',
            },
            { classes: 'alert-status alert-status--security', label: 'Risk to females' },
          ],
        })
      })

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            prisonNumber: 'G4797UD',
            sortBy: 'createdAt',
            sortDirection: 'desc',
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

      it('should replace CSWAP with the correct content for the cell location', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents: [{ offenderNo: 'G123456', eventSubType: 'CR', eventStatus: 'SCH' }],
        })

        req.query.scheduledType = 'Releases'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [
              expect.objectContaining({
                cellLocation: 'No cell allocated',
                prisonerNumber: 'G123456',
              }),
            ],
          })
        )
      })

      it('should apply default sort on surname', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents: [
            { offenderNo: 'G4797UD', eventSubType: 'CR', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI', eventSubType: 'CR', eventStatus: 'SCH' },
            { offenderNo: 'G3854XD', eventSubType: 'CR', eventStatus: 'SCH' },
          ],
        })

        req.query.scheduledType = 'Releases'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
              }),
              expect.objectContaining({
                name: 'Shark, Mark - G5966UI',
              }),
              expect.objectContaining({
                name: 'Shave, Dave - G3854XD',
              }),
            ],
          })
        )
      })

      it('should only show scheduled release events', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents: [
            { offenderNo: 'G4797UD', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI' },
            { offenderNo: 'G3854XD' },
          ],
        })

        req.query.scheduledType = 'Releases'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
                prisonerNumber: 'G4797UD',
              }),
            ],
          })
        )
      })

      it('should show None when no cell is configured', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [],
          releaseEvents: [
            {
              offenderNo: 'A112233',
              createDateTime: '2016-11-07T15:13:59.268001',
              fromAgencyDescription: 'Moorland (HMP & YOI)',
              eventStatus: 'SCH',
              movementTypeCode: 'REL',
              movementReasonCode: 'CR',
            },
          ],
        })

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            releaseEvents: [
              expect.objectContaining({
                cellLocation: 'None',
              }),
            ],
          })
        )
      })

      it('should handle situation with no property user description', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([
          {
            location: {
              locationId: 26169,
              locationType: 'BOX',
              description: 'PROP_BOXES-PB014',
              agencyId: 'MDI',
              parentLocationId: 26155,
              currentOccupancy: 0,
              locationPrefix: 'MDI-PROP_BOXES-PB014',
              internalLocationCode: 'PB014',
            },
            sealMark: 'MDA646165646',
            containerType: 'Valuables',
          },
        ])

        await controller.index(req, res)

        expectReleaseEventsToContain(res, {
          personalProperty: [{ boxNumber: 'None', containerType: 'Valuables' }],
        })
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

      it('should handle situation with no property', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([])

        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          personalProperty: [],
        })
      })

      it('should return only relevant alerts', async () => {
        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          relevantAlertFlagLabels: [
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT open',
            },
            {
              classes: 'alert-status alert-status--self-harm',
              label: 'ACCT post closure',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Controlled unlock',
            },
            {
              classes: 'alert-status alert-status--security',
              label: 'Hostage taker',
            },
            {
              classes: 'alert-status alert-status--medical',
              label: 'PEEP',
            },
            { classes: 'alert-status alert-status--security', label: 'Risk to females' },
          ],
        })
      })

      it('should make a call to retrieve hold-on-transfer details for each prisoner with any such alert', async () => {
        await controller.index(req, res)

        expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalledWith(
          {},
          {
            alertCodes: ['TAP', 'TAH', 'TCPA', 'TG', 'TM', 'TPR', 'TSE'],
            prisonNumber: 'G5966UI',
            sortBy: 'createdAt',
            sortDirection: 'desc',
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

      it('should return a single entry for NOTR, excluding ROTLa (i.e TAP event type)', async () => {
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

      it('should replace CSWAP with the correct content for the cell location', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [{ offenderNo: 'G123456', eventSubType: 'NTOR', eventStatus: 'SCH' }],
          releaseEvents: [],
        })

        req.query.scheduledType = 'Transfers'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [
              expect.objectContaining({
                cellLocation: 'No cell allocated',
                prisonerNumber: 'G123456',
              }),
            ],
          })
        )
      })

      it('should apply default sort on surname', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [
            { offenderNo: 'G4797UD', eventSubType: 'NOTR', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI', eventSubType: 'NOTR', eventStatus: 'SCH' },
            { offenderNo: 'G3854XD', eventSubType: 'NOTR', eventStatus: 'SCH' },
          ],
          releaseEvents: [],
        })

        req.query.scheduledType = 'Transfers'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
              }),
              expect.objectContaining({
                name: 'Shark, Mark - G5966UI',
              }),
              expect.objectContaining({
                name: 'Shave, Dave - G3854XD',
              }),
            ],
          })
        )
      })

      it('should only show scheduled transfers', async () => {
        prisonApi.getTransfers = jest.fn().mockResolvedValue({
          courtEvents: [],
          transferEvents: [
            { offenderNo: 'G4797UD', eventSubType: 'NOTR', eventStatus: 'SCH' },
            { offenderNo: 'G5966UI', eventSubType: 'NOTR' },
            { offenderNo: 'G3854XD', eventSubType: 'NOTR' },
          ],
          releaseEvents: [],
        })

        req.query.scheduledType = 'Transfers'

        await controller.index(req, res)

        expect(res.render).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            transferEvents: [
              expect.objectContaining({
                name: 'Cob, Bob - G4797UD',
                prisonerNumber: 'G4797UD',
                reasonDescription: 'Normal Transfer',
              }),
            ],
          })
        )
      })

      it('should handle situation with no property user description', async () => {
        prisonApi.getPrisonerProperty = jest.fn().mockResolvedValue([
          {
            location: {
              locationId: 26169,
              locationType: 'BOX',
              description: 'PROP_BOXES-PB014',
              agencyId: 'MDI',
              parentLocationId: 26155,
              currentOccupancy: 0,
              locationPrefix: 'MDI-PROP_BOXES-PB014',
              internalLocationCode: 'PB014',
            },
            sealMark: 'MDA646165646',
            containerType: 'Valuables',
          },
        ])

        await controller.index(req, res)

        expectTransferEventsToContain(res, {
          personalProperty: [{ boxNumber: 'None', containerType: 'Valuables' }],
        })
      })
    })

    describe('Events without any hold-against-transfer alerts', () => {
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

        expect(prisonerAlertsApi.getAlertsForLatestBooking).not.toHaveBeenCalled()
      })

      it('should not show hold-against-transfer details', async () => {
        await controller.index(req, res)

        expectCourtEventsToContain(res, {
          holdAgainstTransferAlerts: undefined,
        })
      })
    })
  })

  describe('Events with only inactive hold-against-transfer alerts', () => {
    beforeEach(() => {
      prisonApi.getTransfers = jest.fn().mockResolvedValue({
        courtEvents: courtEventsWithOnlyInactiveTransferOnHoldAlerts,
        transferEvents: [],
        releaseEvents: [],
      })
      offenderSearchApi.getPrisonersDetails = jest
        .fn()
        .mockResolvedValue(prisonerSearchResultWithOnlyInactiveHoldOnTransfer)
      prisonerAlertsApi.getAlertsForLatestBooking.mockResolvedValue({
        content: holdAgainstTransferWithOnlyInactiveAlertDetailsResponse,
      })
    })

    it('should make a call to retrieve hold on transfer details', async () => {
      await controller.index(req, res)

      expect(prisonerAlertsApi.getAlertsForLatestBooking).toHaveBeenCalled()
    })

    it('should not show hold-against-transfer details', async () => {
      await controller.index(req, res)

      expectCourtEventsToContain(res, {
        holdAgainstTransferAlerts: undefined,
      })
    })
  })
})
