import moment from 'moment'

const considerRisksPage = require('../../pages/receptionMove/receptionConsiderRisksPage')
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
  cy.task('stubSystemAlerts', [
    {
      offenderNo: 'G0873UU',
      expired: false,
      alertCode: 'XR',
    },
    {
      offenderNo: 'G2755UN',
      expired: false,
      alertCode: 'XR',
    },
    {
      offenderNo: 'G2755UN',
      expired: false,
      alertCode: 'XGANG',
    },
    {
      offenderNo: 'G2755UN',
      expired: false,
      alertCode: 'XRF',
    },
  ])
  cy.task('stubOffenderMovements')
  cy.task('stubGetIepSummaryForBookingIds')
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
        addedByFirstName: 'DAVID',
        addedByLastName: 'MICHAELSON',
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
        addedByFirstName: 'DAVID',
        addedByLastName: 'MICHAELSON',
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
        addedByFirstName: 'DAVID',
        addedByLastName: 'MICHAELSON',
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
  cy.task('stubCsraAssessments', {
    offenderNumbers: [offenderNo, 'G0873UU', 'G6795VD'],
    assessments: [
      {
        bookingId: 1161005,
        offenderNo,
        classificationCode: 'HI',
        classification: 'High',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2016-12-22',
        nextReviewDate: '2016-12-23',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessmentComment: "Don't put in cell with others",
        assessorId: 44495,
        assessorUser: 'VQT41X',
      },
      {
        bookingId: 1161006,
        offenderNo: 'G0873UU',
        classificationCode: 'HI',
        classification: 'High',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2016-12-22',
        nextReviewDate: '2016-12-23',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessmentComment: "Don't put in cell with others",
        assessorId: 44495,
        assessorUser: 'VQT41X',
      },
      {
        bookingId: 1161007,
        offenderNo: 'G6795VD',
        classificationCode: 'HI',
        classification: 'Low',
        assessmentCode: 'CSR',
        assessmentDescription: 'CSR Rating',
        cellSharingAlertFlag: true,
        assessmentDate: '2016-12-22',
        nextReviewDate: '2016-12-23',
        assessmentAgencyId: 'MDI',
        assessmentStatus: 'A',
        assessmentSeq: 1,
        assessmentComment: "Don't put in cell with others",
        assessorId: 44495,
        assessorUser: 'VQT41X',
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
  cy.task('stubOffenderNonAssociationsLegacy', {
    agencyDescription: 'HMP Moorland',
    offenderNo: 'G3878UK',
    nonAssociations: [
      {
        effectiveDate: moment(),
        expiryDate: moment().add(2, 'days'),
        offenderNonAssociation: {
          agencyDescription: 'HMP Moorland',
          assignedLivingUnitDescription: 'HMP Moorland',
          offenderNo: 'G3878UK',
          firstName: 'UIENCOT',
          lastName: 'BLANCYANA',
          agencyId: 'MDI',
        },
      },
    ],
  })
  cy.task('stubOffendersInReception', {
    agencyId: 'MDI',
    inReception: [
      {
        offenderNo: 'G0873UU',
        bookingId: 844072,
        dateOfBirth: '1950-12-02',
        firstName: 'Daren',
        lastName: 'Wetch',
      },
      {
        offenderNo: 'G6980GG',
        bookingId: 1142296,
        dateOfBirth: '1984-03-17',
        firstName: 'Onshinthomasin',
        lastName: 'Aisho',
      },
      {
        offenderNo: 'G6795VD',
        bookingId: 1090088,
        dateOfBirth: '1991-01-10',
        firstName: 'Conrad',
        lastName: 'Nattrass',
      },
      {
        offenderNo: 'G2755UN',
        bookingId: 1161005,
        dateOfBirth: '1989-06-16',
        firstName: 'Okouston',
        lastName: 'Bradisha',
      },
    ],
  })
  cy.task('stubMoveToCell')
})

context('Successful reception move journey', () => {
  it('should complete a reception move', () => {
    const page = considerRisksPage.goTo(offenderNo)

    page.receptionMoveHeaders().should('exist')
    page.nonAssociationsLink().should('exist')
    page.form().confirmMoveYes().click()
    page.form().submitButton().click()
    cy.title().should('eq', 'Confirm reception move - Digital Prison Services')
    page.form().submitButton().click()
    page
      .errorSummary()
      .should('contain', 'Select a reason for the move')
      .and('contain', 'Explain why the person is being moved to reception')
    page.form().selectReceptionReason().click()
    page.form().moveReason().type('Risk')
    page.form().submitButton().click()
    page.errorSummary().should('contain', 'Provide more detail about why this person is being moved to reception')
    page
      .form()
      .moveReason()
      .type('{backspace}{backspace}{backspace}{backspace}Transfer due to staff conflict of interest')
    page.form().submitButton().click()
    cy.title().should('eq', 'This person has been moved to reception - Digital Prison Services')
  })
})

context('Reception full journey', () => {
  it('should redirect to reception full page', () => {
    cy.task('stubReceptionWithCapacity', {
      agencyId: 'MDI',
      reception: [],
    })

    cy.visit(`/prisoner/${offenderNo}/reception-move/consider-risks-reception`, { failOnStatusCode: false })

    cy.title().should('eq', 'No space available in reception - Digital Prison Services')
    cy.get('.govuk-back-link')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('http://localhost:3008/prisoner/G3878UK/reception-move/consider-risks-reception')
      })
    cy.get('[data-test="location-details-link"]')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('/prisoner/G3878UK/location-details')
      })
  })
})
