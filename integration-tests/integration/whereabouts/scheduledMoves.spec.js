import moment from 'moment'

const agencyDetails = { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' }
const movementReasons = [
  { code: '1', description: 'Visit Dying Relative' },
  { code: 'CRT', description: 'Court Appearance' },
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
    eventSubType: '19',
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
]

const toCourtEventRow = ($cell) => ({
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
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.task('stubAgencyDetails', { agencyId: 'MDI', details: agencyDetails })
    cy.task('stubMovementReasons', movementReasons)
    cy.task('stubTransfers', {
      courtEvents: [],
      transferEvents: [],
      releaseEvents: [],
    })
    cy.login()
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
    cy.get('#movementReason').contains('Visit Dying Relative')
    cy.get('#movementReason').contains('Court Appearance')
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

            const rows = Array.from($tableRows).map(($row) => toCourtEventRow($row.cells))

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
})
