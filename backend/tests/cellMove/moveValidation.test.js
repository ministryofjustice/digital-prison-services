Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const { moveValidationFactory } = require('../../controllers/cellMove/moveValidation')

describe('move validation', () => {
  let req
  let res
  let logError
  let controller

  const elite2Api = {}

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

    elite2Api.getDetails = jest.fn()
    elite2Api.getInmatesAtLocation = jest.fn()
    elite2Api.getLocation = jest.fn()
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

    controller = moveValidationFactory({ elite2Api, logError })
  })

  it('Makes the expected API calls on get', async () => {
    elite2Api.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo, true)
    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, 'A12346', true)
    expect(elite2Api.getNonAssociations).toHaveBeenCalledWith(res.locals, 1234)
    expect(elite2Api.getLocation).toHaveBeenCalledWith(res.locals, 1)
    expect(elite2Api.getLocation).toHaveBeenCalledWith(res.locals, 2)
    expect(elite2Api.getLocation).toHaveBeenCalledWith(res.locals, 3)
    expect(elite2Api.getInmatesAtLocation).toHaveBeenCalledWith(res.locals, 1, {})
  })

  it('Passes the expected data to the template on get', async () => {
    elite2Api.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        offenderName: 'Test User',
        offenderNo,
        csraWarningMessage: 'who is CSRA high into a cell with a prisoner who is CSRA high',
        categoryWarning: true,
        showRisks: true,
        nonAssociations: [
          {
            name: 'Bloggs, Jim',
            location: 'MDI-1-1-3',
            type: 'Do Not Locate on Same Wing',
            reason: 'Rival gang',
            comment: 'Test comment 2',
            prisonNumber: 'ABC125',
          },
        ],
        currentOffenderActiveAlerts: [
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Test User’s alert are',
            title: 'who has a Risk to LGB alert into a cell with a prisoner who has a sexual orientation of Homosexual',
          },
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Test User’s alert are',
            title: 'who is an E-List prisoner into a cell with another prisoner',
          },
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Test User’s alert are',
            title: 'who has a Gang member alert into a cell with another prisoner',
          },
          {
            comment: 'test',
            date: 'Date added: 20 August 2020',
            subTitle: 'The details of Test User’s alert are',
            title: 'who has an Isolated Prisoner alert into a cell with another prisoner',
          },
        ],
        currentOccupantsActiveAlerts: [
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Occupant User’s alert are',
            title: 'into a cell with a prisoner who has a Gang member alert',
          },
          {
            comment: 'test',
            date: 'Date added: 20 August 2020',
            subTitle: 'The details of Occupant User’s alert are',
            title: 'into a cell with a prisoner who has an Isolated Prisoner alert',
          },
        ],
      })
    )
  })

  it('Passes the expected CSRA message and sexuality warning when LGB alert but no sexuality', async () => {
    elite2Api.getDetails
      .mockResolvedValueOnce({ ...getCurrentOffenderDetailsResponse, csra: 'Standard' })
      .mockResolvedValueOnce({ ...getCurrentOccupierDetailsResponse, profileInformation: [] })
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        csraWarningMessage: 'who is CSRA standard into a cell with a prisoner who is CSRA high',
        showRisks: true,
        currentOffenderActiveAlerts: [
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Test User’s alert are',
            title: 'who is an E-List prisoner into a cell with another prisoner',
          },
          {
            comment: 'has a large poster on cell wall',
            date: 'Date added: 20 August 2019',
            subTitle: 'The details of Test User’s alert are',
            title: 'who has a Gang member alert into a cell with another prisoner',
          },
          {
            comment: 'test',
            date: 'Date added: 20 August 2020',
            subTitle: 'The details of Test User’s alert are',
            title: 'who has an Isolated Prisoner alert into a cell with another prisoner',
          },
        ],
      })
    )
  })

  it('Passes no CSRA message when both standard', async () => {
    elite2Api.getDetails
      .mockResolvedValueOnce({ ...getCurrentOffenderDetailsResponse, csra: 'Standard' })
      .mockResolvedValueOnce({ ...getCurrentOccupierDetailsResponse, csra: 'Standard' })
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        csraWarningMessage: null,
        showRisks: true,
      })
    )
  })

  it('Does not pass alerts and CSRA when there are no occupants', async () => {
    elite2Api.getDetails.mockResolvedValueOnce({
      ...getCurrentOffenderDetailsResponse,
      csra: 'Standard',
      categoryCode: 'C',
    })
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([])
    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'cellMove/moveValidation.njk',
      expect.objectContaining({
        csraWarningMessage: false,
        currentOffenderActiveAlerts: false,
        currentOccupantsActiveAlerts: [],
        categoryWarning: false,
        showRisks: false,
      })
    )
  })

  it('Does not pass category warning if no inmates', async () => {
    elite2Api.getDetails.mockResolvedValueOnce({ ...getCurrentOffenderDetailsResponse, csra: 'Standard' })
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([])
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
    elite2Api.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
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
    elite2Api.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    req.body = { confirmation: 'yes' }
    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/cell-move/confirm-cell-move?cellId=1`)
  })

  it('Redirects when the user has changed their mind', async () => {
    elite2Api.getDetails
      .mockResolvedValueOnce(getCurrentOffenderDetailsResponse)
      .mockResolvedValueOnce(getCurrentOccupierDetailsResponse)
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([{ offenderNo: 'A12346' }])
    req.body = { confirmation: 'no' }
    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/cell-move/select-cell`)
  })

  it('Redirects to confirm cell move when there are no warnings', async () => {
    elite2Api.getNonAssociations = jest.fn().mockResolvedValue({})
    elite2Api.getDetails = jest.fn().mockResolvedValue({ firstName: 'Bob', lastName: 'Doe', alerts: [] })
    elite2Api.getLocation
      .mockResolvedValueOnce(cellLocationData)
      .mockResolvedValueOnce(parentLocationData)
      .mockResolvedValueOnce(superParentLocationData)
    elite2Api.getInmatesAtLocation.mockResolvedValue([])

    await controller.index(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/prisoner/ABC123/cell-move/confirm-cell-move?cellId=1')
  })
})
