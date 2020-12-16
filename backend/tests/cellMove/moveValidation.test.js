Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const moveValidationController = require('../../controllers/cellMove/moveValidation')

describe('move validation', () => {
  let req
  let res
  let logError
  let controller

  const prisonApi = {}

  const offenderNo = 'ABC123'
  const cellId = 1

  const cellLocationData = {
    parentLocationId: 2,
  }

  const parentLocationData = {
    parentLocationId: 3,
  }

  const superParentLocationData = {
    locationPrefix: 'MDI-1',
  }

  const getCurrentOffenderDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
    csra: 'High',
    agencyId: 'MDI',
    categoryCode: 'A',
    assessments: [],
    assignedLivingUnit: {},
    alerts: [
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'RLG',
        alertCodeDescription: 'Risk to LGB',
        alertId: 1,
        alertType: 'X',
        alertTypeDescription: 'Risk to LGB',
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
        alertCode: 'XEL',
        alertCodeDescription: 'E-List',
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
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'PEEP',
        alertCodeDescription: 'Peep',
        alertId: 1,
        alertType: 'P',
        alertTypeDescription: 'Peep',
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
        alertCode: 'XTACT',
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
      {
        alertId: 3,
        alertType: 'V',
        alertTypeDescription: 'Vulnerability',
        alertCode: 'VIP',
        alertCodeDescription: 'Isolated Prisoner',
        comment: 'test',
        dateCreated: '2020-08-20',
        expired: false,
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
      },
    ],
    profileInformation: [],
  }

  const getCurrentOccupierDetailsResponse = {
    bookingId: 1235,
    firstName: 'Occupant',
    lastName: 'User',
    csra: 'High',
    agencyId: 'MDI',
    offenderNo: 'A12346',
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
      {
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
        alertCode: 'PEEP',
        alertCodeDescription: 'Peep',
        alertId: 1,
        alertType: 'P',
        alertTypeDescription: 'Peep',
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
        alertCode: 'XTACT',
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
      {
        alertId: 3,
        alertType: 'V',
        alertTypeDescription: 'Vulnerability',
        alertCode: 'VIP',
        alertCodeDescription: 'Isolated Prisoner',
        comment: 'test',
        dateCreated: '2020-08-20',
        expired: false,
        active: true,
        addedByFirstName: 'John',
        addedByLastName: 'Smith',
      },
    ],
    profileInformation: [{ type: 'SEXO', resultValue: 'Homosexual' }],
  }

  beforeEach(() => {
    logError = jest.fn()

    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: { cellId },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    prisonApi.getDetails = jest.fn()
    prisonApi.getInmatesAtLocation = jest.fn()
    prisonApi.getLocation = jest
      .fn()
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    prisonApi.getNonAssociations = jest.fn().mockResolvedValue({
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
          effectiveDate: moment()
            .add(7, 'days')
            .format('YYYY-MM-DDTHH:mm:ss'),
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
          reasonCode: 'VIC',
          reasonDescription: 'Victim',
          typeCode: 'WING',
          typeDescription: 'Do Not Locate on Same Wing',
          effectiveDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
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
          effectiveDate: moment()
            .subtract(1, 'years')
            .format('YYYY-MM-DDTHH:mm:ss'),
          authorisedBy: 'string',
          comments: 'Test comment 2',
          offenderNonAssociation: {
            offenderNo: 'ABC125',
            firstName: 'Jim',
            lastName: 'Bloggs',
            reasonCode: 'RIV',
            reasonDescription: 'Rival gang',
            agencyDescription: 'Moorland (HMP & YOI)',
            assignedLivingUnitDescription: 'MDI-1-1-3',
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

    controller = moveValidationController({ prisonApi, logError })
  })

  it('Makes the expected API calls on get', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)

    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, 'A12346', true)
    expect(prisonApi.getNonAssociations).toHaveBeenCalledWith(res.locals, 1234)
    expect(prisonApi.getLocation).toHaveBeenCalledWith(res.locals, 1)
    expect(prisonApi.getLocation).toHaveBeenCalledWith(res.locals, 2)
    expect(prisonApi.getLocation).toHaveBeenCalledWith(res.locals, 3)
    expect(prisonApi.getInmatesAtLocation).toHaveBeenCalledWith(res.locals, 1, {})
  })

  it('Passes the expected data to the template on get', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)

    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith('cellMove/moveValidation.njk', {
      categoryWarning: true,
      currentOccupantsWithFormattedActiveAlerts: [
        {
          alerts: [
            {
              comment: 'has a large poster on cell wall',
              date: 'Date added: 20 August 2019',
              title: 'a Gang member alert.',
            },
            {
              comment: 'test',
              date: 'Date added: 20 August 2020',
              title: 'an Isolated Prisoner alert.',
            },
          ],
          name: 'Occupant User',
        },
      ],
      currentOffenderActiveAlerts: [
        {
          comment: 'has a large poster on cell wall',
          date: 'Date added: 20 August 2019',
          title:
            'a Risk to LGB alert. You have selected a cell with a prisoner who has a sexual orientation of Homosexual.',
        },
        {
          comment: 'has a large poster on cell wall',
          date: 'Date added: 20 August 2019',
          title: 'an E-List alert.',
        },
        {
          comment: 'has a large poster on cell wall',
          date: 'Date added: 20 August 2019',
          title: 'a Gang member alert.',
        },
        {
          comment: 'test',
          date: 'Date added: 20 August 2020',
          title: 'an Isolated Prisoner alert.',
        },
      ],
      dpsUrl: 'http://localhost:3000/',
      errors: undefined,
      nonAssociations: [
        {
          comment: 'Test comment 2',
          location: 'MDI-1-1-3',
          name: 'Bloggs, Jim',
          prisonNumber: 'ABC125',
          reason: 'Rival gang',
          type: 'Do Not Locate on Same Wing',
        },
      ],
      offenderNo: 'ABC123',
      offenderName: 'Test User',
      offendersFormattedNamesWithCsra: ['Test User is CSRA High', 'Occupant User is CSRA High'],
      prisonerNameForBreadcrumb: 'User, Test',
      profileUrl: '/prisoner/ABC123',
      selectCellUrl: '/prisoner/ABC123/cell-move/select-cell',
      showOffendersNamesWithCsra: true,
      showRisks: true,
      stringListOfCurrentOccupantsNames: 'Occupant User',
    })
  })

  it('Should warn that the prisoner is non hetro when occupants have risk to LGBT alert', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce({
        ...getCurrentOffenderDetailsResponse,
        profileInformation: [{ type: 'SEXO', resultValue: 'Homosexual' }],
        alerts: [],
      })
      .mockResolvedValueOnce({
        ...getCurrentOccupierDetailsResponse,
        alerts: [
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'RLG',
            alertCodeDescription: 'Risk to LGB',
            alertId: 1,
            alertType: 'X',
            alertTypeDescription: 'Risk to LGB',
            bookingId: 14,
            comment: 'alert comment',
            dateCreated: '2019-08-20',
            dateExpires: null,
            expired: false,
            expiredByFirstName: 'John',
            expiredByLastName: 'Smith',
            offenderNo,
          },
        ],
      })

    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        currentOffenderActiveAlerts: [],
        currentOccupantsWithFormattedActiveAlerts: [
          {
            alerts: [
              {
                comment: 'alert comment',
                date: 'Date added: 20 August 2019',
                title: 'a Risk to LGB alert. You have selected a prisoner who has a sexual orientation of Homosexual.',
              },
            ],
            name: 'Occupant User',
          },
        ],
      })
    )
  })

  it('Should not show CSRA messages when both prisoner and occupants are standard', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce({ ...getCurrentOffenderDetailsResponse, csra: 'Standard' })
      .mockResolvedValueOnce({ ...getCurrentOccupierDetailsResponse, csra: 'Standard' })
    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        showOffendersNamesWithCsra: false,
        showRisks: true,
      })
    )
  })

  it('Does not pass alerts and CSRA when there are no occupants', async () => {
    prisonApi.getDetails.mockResolvedValueOnce({
      ...getCurrentOffenderDetailsResponse,
      csra: 'Standard',
      categoryCode: 'C',
    })
    prisonApi.getInmatesAtLocation.mockResolvedValue([])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        categoryWarning: false,
        currentOffenderActiveAlerts: false,
        currentOccupantsWithFormattedActiveAlerts: [],
        showOffendersNamesWithCsra: false,
        showRisks: false,
      })
    )
  })

  it('Does not pass category warning if no inmates', async () => {
    prisonApi.getDetails.mockResolvedValueOnce({ ...getCurrentOffenderDetailsResponse, csra: 'Standard' })
    prisonApi.getInmatesAtLocation.mockResolvedValue([])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        categoryWarning: false,
        showRisks: false,
      })
    )
  })

  it('Redirects when form has been triggered with no data', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    req.body = {}
    await controller.post(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        errors: [{ href: '#confirmation', text: 'Select yes if you are sure you want to select the cell' }],
      })
    )
  })

  it('Redirects when the user has confirmed they are happy', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    req.body = { confirmation: 'yes' }
    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=1`)
  })

  it('Redirects when the user has changed their mind', async () => {
    prisonApi.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    prisonApi.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    req.body = { confirmation: 'no' }
    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/cell-move/select-cell`)
  })

  it('Redirects to confirm cell move when there are no warnings', async () => {
    prisonApi.getNonAssociations = jest.fn().mockResolvedValue({})
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'Bob', lastName: 'Doe', alerts: [] })
    prisonApi.getInmatesAtLocation.mockResolvedValue([])

    await controller.index(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/cell-move/confirm-cell-move?cellId=1')
  })
})
