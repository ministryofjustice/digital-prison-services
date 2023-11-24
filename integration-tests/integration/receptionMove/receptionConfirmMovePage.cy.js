const receptionConfirmMovePage = require('../../pages/receptionMove/receptionConfirmMovePage')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')

const offenderNo = 'G3878UK'

before(() => {
  cy.clearCookies()
  cy.task('resetAndStubTokenVerification')
  cy.task('stubSignIn', {
    username: 'ITAG_USER',
    caseload: 'MDI',
    roles: ['ROLE_CELL_MOVE'],
  })
  cy.signIn()
  cy.task('stubOffenderFullDetails', {
    ...offenderFullDetails,
    alerts: [
      {
        alertId: 6,
        alertType: 'X',
        alertTypeDescription: 'Security',
        alertCode: 'XGANG',
        alertCodeDescription: 'Gang Member',
        dateCreated: '2023-10-10',
        expired: false,
        active: true,
        addedByFirstName: 'GURNANK',
        addedByLastName: 'CHEEMA',
      },
      {
        alertId: 5,
        alertType: 'X',
        alertTypeDescription: 'Security',
        alertCode: 'XA',
        alertCodeDescription: 'Arsonist',
        dateCreated: '2023-10-10',
        expired: false,
        active: true,
        addedByFirstName: 'GURNANK',
        addedByLastName: 'CHEEMA',
      },
      {
        alertId: 7,
        alertType: 'X',
        alertTypeDescription: 'Security',
        alertCode: 'XR',
        alertCodeDescription: 'Racist',
        dateCreated: '2023-10-10',
        expired: false,
        active: true,
        addedByFirstName: 'GURNANK',
        addedByLastName: 'CHEEMA',
      },
      {
        alertId: 2,
        alertType: 'H',
        alertTypeDescription: 'Self Harm',
        alertCode: 'HA1',
        alertCodeDescription: 'ACCT Post Closure (HMPS)',
        dateCreated: '2016-12-23',
        dateExpires: '2017-01-01',
        modifiedDateTime: '2017-05-09T21:57:05.254213',
        expired: false,
        active: true,
        addedByFirstName: 'EASTZO',
        addedByLastName: 'CLIFTOLINE',
        expiredByFirstName: 'ADMIN&ONB',
        expiredByLastName: 'CNOMIS',
      },
    ],
  })
  cy.task('stubOffenderBasicDetails', offenderBasicDetails)
  cy.task('stubReceptionWithCapacity', {
    agencyId: 'MDI',
    reception: [
      {
        id: 4007,
        description: 'MDI-RECP',
        capacity: 100,
        noOfOccupants: 100,
        attributes: [],
      },
    ],
  })
  cy.task('stubCellMoveTypes', [
    {
      domain: 'CHG_HOUS_RSN',
      code: 'RAIM',
      description: 'Reception and induction moves',
      activeFlag: 'Y',
      listSeq: 1,
      systemDataFlag: 'N',
      subCodes: [],
    },
    {
      domain: 'CHG_HOUS_RSN',
      code: 'SS',
      description: 'Someone’s safety',
      activeFlag: 'Y',
      listSeq: 2,
      systemDataFlag: 'N',
      subCodes: [],
    },
    {
      domain: 'CHG_HOUS_RSN',
      code: 'SPP',
      description: 'Security of the prison or other people',
      activeFlag: 'Y',
      listSeq: 2,
      systemDataFlag: 'N',
      subCodes: [],
    },
    {
      domain: 'CHG_HOUS_RSN',
      code: 'HOSP',
      description: 'Healthcare',
      activeFlag: 'Y',
      listSeq: 2,
      systemDataFlag: 'N',
      subCodes: [],
    },
    {
      domain: 'CHG_HOUS_RSN',
      code: 'PCM',
      description: 'Maintenance of the prison or cell',
      activeFlag: 'Y',
      listSeq: 2,
      systemDataFlag: 'N',
      subCodes: [],
    },
    {
      domain: 'CHG_HOUS_RSN',
      code: 'PCGMM',
      description: 'General moves',
      activeFlag: 'Y',
      listSeq: 2,
      systemDataFlag: 'N',
      subCodes: [],
    },
  ])
})

describe('Reception confirm move page ', () => {
  it('should load correct data to page', () => {
    const page = receptionConfirmMovePage.goTo(offenderNo)

    cy.title().should('eq', 'Confirm reception move - Digital Prison Services')
    page.govInsetTextMessage().should('contain', 'You must have checked any local processes for non-associations.')
    page.cancelLink()
  })
})

describe('Reception full journey', () => {
  it('should redirect to reception full page', () => {
    cy.task('stubReceptionWithCapacity', {
      agencyId: 'MDI',
      reception: [],
    })

    const page = receptionConfirmMovePage.goTo(offenderNo)
    page.form().selectReceptionReason().click()
    page.form().moveReason().type('Urgent medical appointment')
    page.form().submitButton().click()

    cy.title().should('eq', 'No space available in reception - Digital Prison Services')
    cy.get('.govuk-back-link')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('http://localhost:3008/prisoner/G3878UK/reception-move/confirm-reception-move')
      })
    cy.get('[data-test="location-details-link"]')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('/prisoner/G3878UK/location-details')
      })
  })
})
