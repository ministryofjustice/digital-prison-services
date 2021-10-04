import moment from 'moment'

const agencyDetails = { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' }
const movementReasons = [
  { code: '1', description: 'Visit Dying Relative' },
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

const alerts = [
  {
    alertType: 'T',
    alertCode: 'HA',
    active: true,
    expired: false,
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

const prisonerSearchDetails = [
  {
    prisonerNumber: 'G4797UD',
    bookingId: 1,
    firstName: 'BOB',
    lastName: 'COB',
    cellLocation: '1-2-006',
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
  {
    prisonerNumber: 'G5966UI',
    bookingId: 2,
    firstName: 'MARK',
    lastName: 'SHARK',
    cellLocation: '1-2-007',
    alerts,
  },
]

const toScheduledMove = ($cell) => ({
  name: $cell[0]?.textContent,
  cell: $cell[1]?.textContent,
  property: $cell[2]?.textContent,
  alerts: $cell[3]?.textContent,
  reason: $cell[4]?.textContent,
  destination: $cell[5]?.textContent,
})

context('Scheduled movements', () => {
  const today = moment()

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: agencyDetails })
    cy.task('stubMovementReasons', movementReasons)
    cy.task('stubTransfers', {
      courtEvents: [],
      transferEvents: [],
      releaseEvents: [],
    })
    cy.signIn()
  })

  it('should load page with the correct title', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
    cy.get('h1').contains(`People due to leave Moorland (HMP & YOI) on ${today.format('D MMMM YYYY')}`)
  })

  it('should default to the current date formatted correctly', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
    cy.get('#date').should('have.value', today.format('DD/MM/YYYY'))
  })

  it('should load all movement reasons into the select box', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
    cy.get('#scheduledType').contains('Court')
    cy.get('#scheduledType').contains('Releases')
    cy.get('#scheduledType').contains('Transfers')
  })

  it('should hide the release and transfer sections when the court scheduled type has been selected', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves?scheduledType=Court')
    cy.get('#court').should('be.visible')
    cy.get('#releases').should('not.exist')
    cy.get('#transfers').should('not.exist')
  })

  it('should hide the court and release sections when the transfer scheduled type has been selected', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves?scheduledType=Transfers')
    cy.get('#transfers').should('be.visible')
    cy.get('#releases').should('not.exist')
    cy.get('#court').should('not.exist')
  })

  it('should hide the court and transfer sections when the releases scheduled type has been selected', () => {
    cy.visit('/manage-prisoner-whereabouts/scheduled-moves?scheduledType=Releases')
    cy.get('#releases').should('be.visible')
    cy.get('#court').should('not.exist')
    cy.get('#transfers').should('not.exist')
  })

  context('Court appearances', () => {
    it('should display default message for no court appearances', () => {
      cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
      cy.get('#no-court-events').contains(`There are no court appearances arranged for ${today.format('D MMMM YYYY')}`)
    })

    context('With court appearances', () => {
      beforeEach(() => {
        cy.task('resetTransfersStub')
        cy.task('stubTransfers', {
          courtEvents,
          transferEvents: [],
          releaseEvents: [],
        })
        cy.task('stubPrisonerSearchDetails', prisonerSearchDetails)
        cy.task('stubPrisonerProperty', propertyResponse)
      })

      it('should display court appearances in the table correctly', () => {
        cy.visit('/manage-prisoner-whereabouts/scheduled-moves')

        cy.get('[data-qa="court-events-table"]')
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 1)

            const rows = Array.from($tableRows).map(($row) => toScheduledMove($row.cells))

            expect(rows[0].name).to.contain('Cob, Bob - G4797UD')
            expect(rows[0].cell).to.eq('1-2-006')
            expect(rows[0].property).contains('Valuables - Box 14')
            expect(rows[0].property).contains('Confiscated - Box 15')
            expect(rows[0].alerts).contains('ACCT open')
            expect(rows[0].reason).eq('Court Appearance')
            expect(rows[0].destination).eq("Aberdeen Sheriff's Court (ABDSHF)")
          })
      })
    })
  })

  context('Releases', () => {
    it('should display default message for no releases scheduled for given date', () => {
      cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
      cy.get('#no-release-events').contains(`There are no releases arranged for ${today.format('D MMMM YYYY')}`)
    })

    context('With releases', () => {
      beforeEach(() => {
        cy.task('resetTransfersStub')
        cy.task('stubTransfers', {
          courtEvents: [],
          transferEvents: [],
          releaseEvents,
        })
        cy.task('stubPrisonerSearchDetails', prisonerSearchDetails)
        cy.task('stubPrisonerProperty', propertyResponse)
      })

      it('should display releases in the table correctly', () => {
        cy.visit('/manage-prisoner-whereabouts/scheduled-moves')

        cy.get('[data-qa="release-events-table"]')
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 1)

            const rows = Array.from($tableRows).map(($row) => toScheduledMove($row.cells))

            expect(rows[0].name).to.contain('Shave, Dave - G3854XD')
            expect(rows[0].cell).to.eq('1-2-008')
            expect(rows[0].property).contains('Valuables - Box 14')
            expect(rows[0].property).contains('Confiscated - Box 15')
            expect(rows[0].alerts).contains('ACCT open')
            expect(rows[0].reason).eq('Conditional Release (CJA91) -SH Term>1YR')
          })
      })
    })
  })

  context('Transfers', () => {
    it('should display default message for no transfers scheduled for given date', () => {
      cy.visit('/manage-prisoner-whereabouts/scheduled-moves')
      cy.get('#no-transfer-events').contains(`There are no transfers arranged for ${today.format('D MMMM YYYY')}`)
    })

    context('With releases', () => {
      beforeEach(() => {
        cy.task('resetTransfersStub')
        cy.task('stubTransfers', {
          courtEvents: [],
          transferEvents,
          releaseEvents: [],
        })
        cy.task('stubPrisonerSearchDetails', prisonerSearchDetails)
        cy.task('stubPrisonerProperty', propertyResponse)
      })

      it('should display releases in the table correctly', () => {
        cy.visit('/manage-prisoner-whereabouts/scheduled-moves')

        cy.get('[data-qa="transfer-events-table"]')
          .find('tbody')
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 1)

            const rows = Array.from($tableRows).map(($row) => toScheduledMove($row.cells))

            expect(rows[0].name).to.contain('Shark, Mark - G5966UI')
            expect(rows[0].cell).to.eq('1-2-007')
            expect(rows[0].property).contains('Valuables - Box 14')
            expect(rows[0].property).contains('Confiscated - Box 15')
            expect(rows[0].alerts).contains('ACCT open')
            expect(rows[0].reason).eq('Normal Transfer')
            expect(rows[0].destination).eq('Leeds (HMP)')
          })
      })
    })
  })
})
