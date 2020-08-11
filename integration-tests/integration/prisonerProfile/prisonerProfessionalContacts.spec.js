const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

const offenderNo = 'A12345'
const otherContacts = [
  {
    lastName: 'KIMBUR',
    firstName: 'ARENENG',
    contactType: 'O',
    contactTypeDescription: 'Official',
    relationship: 'PROB',
    relationshipDescription: 'Probation Officer',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 6865390,
    personId: 111,
    activeFlag: true,
    approvedVisitorFlag: false,
    canBeContactedFlag: false,
    awareOfChargesFlag: false,
    contactRootOffenderId: 0,
    bookingId: 123,
  },
  {
    lastName: 'LYDYLE',
    firstName: 'URIUALCHE',
    contactType: 'O',
    contactTypeDescription: 'Official',
    relationship: 'CA',
    relationshipDescription: 'Case Administrator',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 7350143,
    personId: 222,
    activeFlag: true,
    approvedVisitorFlag: false,
    canBeContactedFlag: false,
    awareOfChargesFlag: false,
    contactRootOffenderId: 0,
    bookingId: 123,
  },
  {
    lastName: 'SMITH',
    firstName: 'TREVOR',
    contactType: 'O',
    contactTypeDescription: 'Official',
    relationship: 'CA',
    relationshipDescription: 'Case Administrator',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 7350143,
    personId: 222,
    activeFlag: true,
    approvedVisitorFlag: false,
    canBeContactedFlag: false,
    awareOfChargesFlag: false,
    contactRootOffenderId: 0,
    bookingId: 123,
  },
  {
    lastName: 'JONES',
    firstName: 'ANNE',
    contactType: 'O',
    contactTypeDescription: 'Official',
    relationship: 'OFS',
    relationshipDescription: 'Offender Supervisor',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 7350143,
    personId: 222,
    activeFlag: true,
    approvedVisitorFlag: false,
    canBeContactedFlag: false,
    awareOfChargesFlag: false,
    contactRootOffenderId: 0,
    bookingId: 123,
  },
  {
    lastName: 'JONES',
    firstName: 'ANNE',
    contactType: 'O',
    contactTypeDescription: 'Official',
    relationship: 'COM',
    relationshipDescription: 'Community Offender Manager',
    emergencyContact: false,
    nextOfKin: false,
    relationshipId: 7350143,
    personId: 222,
    activeFlag: true,
    approvedVisitorFlag: false,
    canBeContactedFlag: false,
    awareOfChargesFlag: false,
    contactRootOffenderId: 0,
    bookingId: 123,
  },
]

context('Prisoner professional contacts', () => {
  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
    cy.task('stubPathFinderOffenderDetails', null)
    cy.task('stubClientCredentialsRequest')
  })

  context('When there is data', () => {
    const businessPrimary = {
      addressType: 'Business',
      flat: '222',
      locality: 'Test locality',
      premise: '999',
      street: 'Business street',
      town: 'London',
      postalCode: 'W1 ABC',
      county: 'London',
      country: 'England',
      comment: null,
      primary: true,
      noFixedAddress: false,
      startDate: '2020-05-01',
      endDate: null,
      phones: [],
      addressUsages: [],
    }

    const businessNonPrimary = {
      addressType: 'Business',
      flat: '222',
      locality: 'New locality',
      premise: '000',
      street: 'Business street',
      town: 'Manchester',
      postalCode: 'W2 DEF',
      county: 'Greater Manchester',
      country: 'England',
      comment: null,
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      endDate: null,
      phones: [],
      addressUsages: [],
    }

    before(() => {
      cy.task('stubProfessionalContacts', {
        offenderBasicDetails,
        contacts: { otherContacts },
        personAddresses: [businessPrimary, businessNonPrimary],
        personEmails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
        personPhones: [{ number: '02222222222', type: 'MOB' }, { number: '033333333333', type: 'BUS', ext: '123' }],
        prisonOffenderManagers: {
          primary_pom: { staffId: 1, name: 'SMITH, JANE' },
          secondary_pom: { staffId: 2, name: 'DOE, JOHN' },
        },
      })

      cy.visit(`/prisoner/${offenderNo}/professional-contacts`)
    })

    it('Should show the correct relationship descriptions in alphabetical order', () => {
      cy.get('[data-test="professional-contacts-relationship"]').then($relationships => {
        cy.get($relationships)
          .its('length')
          .should('eq', 5)
        expect($relationships.get(0).innerText).to.contain('Case Administrator')
        expect($relationships.get(1).innerText).to.contain('Community Offender Manager')
        expect($relationships.get(2).innerText).to.contain('Offender Supervisor')
        expect($relationships.get(3).innerText).to.contain('Prison Offender Manager')
        expect($relationships.get(4).innerText).to.contain('Probation Officer')
      })
    })

    it('Should show the correct contacts', () => {
      cy.get('[data-test="professional-contacts-contact"]').then($contacts => {
        cy.get($contacts)
          .its('length')
          .should('eq', 12)
        expect($contacts.get(0).innerText).to.contain('Trevor Smith')
        expect($contacts.get(1).innerText).to.contain('Trevor Smith')
        expect($contacts.get(2).innerText).to.contain('Uriualche Lydyle')
        expect($contacts.get(3).innerText).to.contain('Uriualche Lydyle')
        expect($contacts.get(4).innerText).to.contain('Anne Jones')
        expect($contacts.get(5).innerText).to.contain('Anne Jones')
        expect($contacts.get(7).innerText).to.contain('Anne Jones')
        expect($contacts.get(8).innerText).to.contain('Jane Smith')
        expect($contacts.get(9).innerText).to.contain('John Doe\n\nCo-worker')
        expect($contacts.get(10).innerText).to.contain('Areneng Kimbur')
        expect($contacts.get(11).innerText).to.contain('Areneng Kimbur')
      })
    })
  })
})
