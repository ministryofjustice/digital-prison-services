const prisonerQuickLookPage = require('../../pages/prisonerProfile/prisonerQuickLookPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { quickLookFullDetails } = require('../../mockData/quickLookFullDetails')

const offenderNo = 'A1234A'

context('Backlink in Prisoner Profile', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-backlink', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubPrisonerProfileSaveBacklink')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()
    })
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
      caseloads: []
    })
  })

  context('digital-prison-services', () => {
    it('Should redirect save-backlink to prisoner profile', () => {
      cy.visit(`/save-backlink?service=digital-prison-services&returnPath=/return&redirectPath=/prisoner/${offenderNo}`)
      cy.location().should((location) => {
        expect(location.pathname).contains(`/prisonerprofile/save-backlink`)
      })
    })
  })

  context('welcome-people-into-prison', () => {
    it('Should redirect save-backlink to prisoner profile', () => {
      cy.visit(
        `/save-backlink?service=welcome-people-into-prison&returnPath=/return&redirectPath=/prisoner/${offenderNo}`
      )
      cy.location().should((location) => {
        expect(location.pathname).contains(`/prisonerprofile/save-backlink`)
      })
    })
  })
})

context('Prisoner quick look data retrieval errors', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-no-caseloads', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()
    })

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
      caseloads: [],
    })

    cy.task('stubQuickLookApiErrors')
  })

  beforeEach(() => {
    cy.visit(`/prisoner/${offenderNo}`)
  })

  it('Should display the appropriate message when there was an error requesting offence data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-offences"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting balance data', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="offender-balances"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting case note adjudications', () => {
    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="incentives-and-adjudications"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  // TODO Details on NN-3056
  it.skip('Should display the appropriate message when there was an error requesting personal details', () => {
    cy.get('[data-test="personal-details"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting visits', () => {
    cy.get('[data-test="visits-details"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })

  it('Should display the appropriate message when there was an error requesting schedules', () => {
    cy.get('[data-test="schedules"]')
      .find('p')
      .then(($element) => {
        expect($element.get(0).innerText).to.eq('Unable to show any of these details. You can try reloading the page.')
      })
  })
})

context('Prisoner profile header', () => {
  const headerProfileData = {
    offenderBasicDetails,
    offenderFullDetails: {
      ...offenderFullDetails,
      profileInformation: [{ type: 'NAT', resultValue: 'British' }],
    },
    iepSummary: {},
    caseNoteSummary: {},
    offenderNo,
    caseloads: []
  }
  beforeEach(() => {
    cy.session('hmpps-session-dev-caseloads', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()
    })

    cy.task('stubQuickLook', quickLookFullDetails)
  })

  it('Should show sunset banner', () => {
    cy.task('stubPrisonerProfileHeaderData', headerProfileData)
    cy.visit(`/prisoner/${offenderNo}`)

    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('.govuk-notification-banner--warning').should('be.visible')
  })

  it('Should show correct header information', () => {
    cy.task('stubPrisonerProfileHeaderData', headerProfileData)
    cy.visit(`/prisoner/${offenderNo}`)

    prisonerQuickLookPage.verifyOnPage('Smith, John')

    cy.get('[data-test="csra-details"]').contains('High - 23/11/2016')
  })

  it('should show complexity text and hide last key worker session', () => {
    cy.task('stubPrisonerProfileHeaderData', {
      ...headerProfileData,
      complexOffenders: [{ offenderNo, level: 'high' }],
      keyworkerDetails: {},
    })
    cy.visit(`/prisoner/${offenderNo}`)

    prisonerQuickLookPage.verifyOnPage('Smith, John')
    cy.get('[data-test="keyworker-name"]').contains('None - high complexity')
    cy.get('[data-test="last-session"]').should('not.exist')
  })

  it('should show not allocated when no key worker is assigned', () => {
    cy.task('stubPrisonerProfileHeaderData', {
      ...headerProfileData,
      keyworkerDetails: {},
    })
    cy.visit(`/prisoner/${offenderNo}`)

    prisonerQuickLookPage.verifyOnPage('Smith, John')
    cy.get('[data-test="keyworker-name"]').contains('Not allocated')
    cy.get('[data-test="last-session"]').contains('No previous session')
  })
})

context('Prisoner quick look', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-quick-look', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()
    })

    cy.task('stubQuickLook', quickLookFullDetails)
  })

  context('When a prisoner is in users caseload', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, profileInformation: [{ type: 'NAT', resultValue: 'British' }] },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.visit(`/prisoner/${offenderNo}`)
    })

    it('Should show correct tabs', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('ul.govuk-tabs__list')
        .find('li')
        .then(($tabs) => {
          expect($tabs.get(0).innerText).to.contain('Quick look')
          expect($tabs.get(1).innerText).to.contain('Personal')
          expect($tabs.get(2).innerText).to.contain('Alerts')
          expect($tabs.get(3).innerText).to.contain('Case notes')
          expect($tabs.get(4).innerText).to.contain('Sentence and release')
        })
    })

    it('Should show correct Offence details', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      prisonerQuickLookPage.verifyOnPage('Smith, John')

      cy.get('[data-test="offence-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('Have blade/article which was sharply pointed in public place')
          expect($summaryValues.get(1).innerText).to.eq('Adult Imprisonment Without Option CJA03')
          expect($summaryValues.get(2).innerText).to.eq('13 December 2020')
        })
    })

    it('Should show correct Money details', () => {
      cy.get('[data-test="money-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('£100.00')
          expect($summaryValues.get(1).innerText).to.eq('£75.50')
          expect($summaryValues.get(2).innerText).to.eq('£50.00')
        })
    })

    it('Should show correct Case notes and adjudications details', () => {
      cy.get('[data-test="incentives-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('1')
          expect($summaryValues.get(1).innerText).to.eq('2')
          expect($summaryValues.get(2).innerText).to.contain('15 August 2018')
          expect($summaryValues.get(2).innerText).to.match(/\d+ days overdue/)
        })
    })

    it('Should show correct Visits details', () => {
      cy.get('[data-test="visits-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('24')
          expect($summaryValues.get(1).innerText).to.eq('4')
          expect($summaryValues.get(2).innerText).to.eq('17 April 2020')
        })
      cy.get('[data-test="visits-details-link"]')
        .should('contain.text', 'View visits details')
        .should('have.attr', 'href')
        .should('include', '/prisoner/A1234A/visits-details')
    })

    it('Should show correct Personal information details', () => {
      cy.get('[data-test="personal-info-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('21')
          expect($summaryValues.get(1).innerText).to.eq('British')
          expect($summaryValues.get(2).innerText).to.eq('12/3456A')
          expect($summaryValues.get(3).innerText).to.eq('12345/57B')
        })
    })

    it('Should show correct Schedule details', () => {
      cy.get('[data-test="schedule-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('Education\n09:00 to 10:00')
          expect($summaryValues.get(1).innerText).to.eq(
            'Case - Benefits - Test Comment\n13:00 to 14:00\nGym - Sports Halls Activity - Test comment\n(cancelled)\n15:00 to 15:30'
          )
          expect($summaryValues.get(2).innerText).to.eq(
            'Gym - Football - Testing a really long comment which is o...\n20:20 to 20:35'
          )
        })
    })

    it('Should show correct Non-associations details', () => {
      cy.get('[data-test="non-associations-summary"]')
        .find('dt')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('In HMP Moorland')
        })
      cy.get('[data-test="non-associations-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('1')
        })
      cy.get('[data-test="non-associations-link"]')
        .should('contain.text', 'Manage non-associations')
        .should('have.attr', 'href')
        .should('include', 'non-associations/prisoner/A1234A/non-associations')
    })

    it('Should show the correct tabs and links', () => {
      cy.get('[data-test="tabs-quick-look"]').should('contain.text', 'Quick look')
      cy.get('[data-test="tabs-personal"]').should('contain.text', 'Personal')
      cy.get('[data-test="tabs-alerts"]').should('contain.text', 'Alerts')
      cy.get('[data-test="tabs-case-notes"]').should('contain.text', 'Case notes')
      cy.get('[data-test="tabs-sentence-release"]').should('contain.text', 'Sentence and release')
      cy.get('[data-test="csra-link"]')
        .should('contain.text', 'View details of CSRA')
        .should('have.attr', 'href')
        .should('include', '/prisoner/A1234A/csra-history')
      cy.get('[data-test="view-alerts-link"]').should('contain.text', 'View alerts')
      cy.get('[data-test="iep-details-link"]').should('contain.text', 'View details for Incentive Level')
      cy.get('[data-test="incentive-details-link"]').should('contain.text', 'View incentive level details')
    })
  })

  context('When someone is currently not in prison', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubQuickLook', {
        ...quickLookFullDetails,
        prisonerNonAssociations: { ...quickLookFullDetails.prisonerNonAssociations, prisonId: 'OUT' },
      })
      cy.visit(`/prisoner/${offenderNo}`)
    })

    it('Should show link to non-associations but not the number of open non-associations', () => {
      cy.get('[data-test="non-associations-summary"]').should('not.exist')

      cy.get('[data-test="non-associations-link"]')
        .should('contain.text', 'Manage non-associations')
        .should('have.attr', 'href')
        .should('include', 'non-associations/prisoner/A1234A/non-associations')
    })
  })

  context('When a prisoner is in users caseload but does not have any visit details (unsentenced)', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubQuickLook', { ...quickLookFullDetails, visitBalances: {} })
    })

    it('Should show correct Visits details', () => {
      cy.visit(`/prisoner/${offenderNo}`)
      cy.get('[data-test="visits-summary"]')
        .find('dd')
        .then(($summaryValues) => {
          expect($summaryValues.get(0).innerText).to.eq('17 April 2020')
        })
    })
  })

  context('When a prisoner is NOT in users caseload', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not display conditionally displayed links to other pages', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="tabs-case-notes"]').should('not.exist')
      cy.get('[data-test="incentive-details-link"]').should('not.exist')
    })
  })

  context('When a user CANNOT view inactive bookings', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not display conditionally displayed links to other pages', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="tabs-case-notes"]').should('not.exist')
    })
  })

  context('When a user has no roles relating to viewing probation documents', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should not show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('not.exist')
    })
  })

  context('When a prisoner does NOT have a record retention record', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
    })

    it('Should display the correct text and link to retention records', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="data-retention-record-details"]').should(
        'contain.text',
        'Prevent removal of this offender record:\n      Not set - \n      \n        Update'
      )
      cy.get('[data-test="data-retention-record-details"] a').should(
        'have.attr',
        'href',
        `/offenders/${offenderNo}/retention-reasons`
      )
    })
  })

  context('When a prisoner does have a record retention record', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        retentionRecord: {
          offenderNo,
          retentionReasons: ['Reason1'],
        },
        offenderNo,
      })
    })

    it('Should display the correct text and link to retention records', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="data-retention-record-details"]').should(
        'contain.text',
        'Prevent removal of this offender record:\n      Yes - \n      \n        View reasons / update'
      )
      cy.get('[data-test="data-retention-record-details"] a').should(
        'have.attr',
        'href',
        `/offenders/${offenderNo}/retention-reasons`
      )
    })
  })
})

context('Finances section', () => {
  context('where damage obligations is zero', () => {
    beforeEach(() => {
      cy.session('hmpps-session-dev', () => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
        cy.signIn()
      })

      quickLookFullDetails.balances.damageObligations = 0
      cy.task('stubQuickLook', quickLookFullDetails)
    })

    context('When a prisoner is in users caseload', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: {
            ...offenderFullDetails,
            profileInformation: [{ type: 'NAT', resultValue: 'British' }],
          },
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo,
        })
      })

      it('Should not show damage obligations balance when it is of zero value', () => {
        cy.visit(`/prisoner/${offenderNo}`)

        prisonerQuickLookPage.verifyOnPage('Smith, John')

        cy.get('[data-test="money-summary"]')
          .find('dd')
          .then(($summaryValues) => {
            expect($summaryValues.length).to.eq(3)
            expect($summaryValues.get(0).innerText).to.eq('£100.00')
            expect($summaryValues.get(1).innerText).to.eq('£75.50')
            expect($summaryValues.get(2).innerText).to.eq('£50.00')
          })
      })
    })
  })

  context('where damage obligations is non-zero', () => {
    before(() => {
      cy.task('reset')
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
      cy.signIn()

      quickLookFullDetails.balances.damageObligations = 65
      cy.task('stubQuickLook', quickLookFullDetails)
    })

    context('When a prisoner is in users caseload', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: {
            ...offenderFullDetails,
            profileInformation: [{ type: 'NAT', resultValue: 'British' }],
          },
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo,
        })
      })

      it('Should show damage obligations balance when it is of non-zero value', () => {
        cy.visit(`/prisoner/${offenderNo}`)

        prisonerQuickLookPage.verifyOnPage('Smith, John')

        cy.get('[data-test="money-summary"]')
          .find('dd')
          .then(($summaryValues) => {
            expect($summaryValues.length).to.eq(4)
            expect($summaryValues.get(0).innerText).to.eq('£100.00')
            expect($summaryValues.get(1).innerText).to.eq('£75.50')
            expect($summaryValues.get(2).innerText).to.eq('£50.00')
            expect($summaryValues.get(3).innerText).to.eq('£65.00')
          })
      })
    })
  })
})

context('When a user has a SOC role', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-soc', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [], roles: ['ROLE_SOC_CUSTODY'] })
      cy.signIn()
    })

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
      //   userRoles: [{ roleCode: 'SOC_CUSTODY' }],
      offenderNo,
    })
  })

  context('And prisoner is not in SOC', () => {
    beforeEach(() => {
      cy.task('stubSocOffenderDetails', {
        status: 404,
        body: { message: 'Offender not found' },
        offenderNumber: offenderNo,
      })
    })
    it('Should show Add to SOC button', () => {
      cy.visit(`/prisoner/${offenderNo}`)
      cy.get('[data-test="soc-referral-button"]')
        .should('contain.text', 'Add to SOC')
        .and('have.attr', 'href')
        .and('match', RegExp(`.*?/offender/${offenderNo}$`))
    })
  })

  context('And prisoner is in SOC', () => {
    beforeEach(() => {
      cy.task('stubSocOffenderDetails', {
        status: 200,
        body: { id: 1, status: 'ACTIVE', nomsId: offenderNo, history: [], band: '2' },
        offenderNumber: offenderNo,
      })
    })
    it('Should show View SOC profile link', () => {
      cy.visit(`/prisoner/${offenderNo}`)
      cy.get('[data-test="soc-profile-link"]')
        .should('contain.text', 'View SOC profile')
        .and('have.attr', 'href')
        .and('match', RegExp('.*?/nominal/1$'))
    })
  })
})

context('When a user has POM role', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-pom', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [], roles: ['ROLE_POM'] })
      cy.signIn()
    })
  })

  context('when offender in caseload', () => {
    beforeEach(() => {
      cy.task('stubIsCaseLoadRestrictedPatient', {
        status: 404,
        body: { message: 'Offender not found' },
      })
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        //   userRoles: [{ roleCode: 'POM' }],
        offenderNo,
      })
    })

    it('Should show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('contain.text', 'View documents held by probation')
    })
  })

  context('when offender not in caseload', () => {
    beforeEach(() => {
      cy.task('stubIsCaseLoadRestrictedPatient', {
        status: 404,
        body: { message: 'Offender not found' },
      })
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails: { ...offenderBasicDetails, agencyId: 'LEI' },
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'POM' }],
        offenderNo,
      })
    })

    it('Should not show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('not.exist')
    })
  })
})

context('When a user has VIEW_PROBATION_DOCUMENTS role', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-probation-documents', () => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: null,
        caseloads: [],
        roles: ['ROLE_VIEW_PROBATION_DOCUMENTS'],
      })
      cy.signIn()
    })
  })
  context('when offender in caseload', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        //   userRoles: [{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }],
        offenderNo,
      })
    })

    it('Should show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('contain.text', 'View documents held by probation')
    })
  })
  context('when offender not in caseload', () => {
    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails: { ...offenderBasicDetails, agencyId: 'LEI' },
        offenderFullDetails: { ...offenderFullDetails, agencyId: 'LEI' },
        iepSummary: {},
        caseNoteSummary: {},
        userRoles: [{ roleCode: 'VIEW_PROBATION_DOCUMENTS' }],
        offenderNo,
      })
    })

    it('Should not show the View documents held by probation link', () => {
      cy.visit(`/prisoner/${offenderNo}`)

      cy.get('[data-test="probation-documents-link"]').should('not.exist')
    })
  })
})

context('When a user can view inactive bookings', () => {
  beforeEach(() => {
    cy.session('hmpps-session-dev-inactive-bookings', () => {
      cy.task('reset')
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: null,
        caseloads: [],
        roles: ['ROLE_INACTIVE_BOOKINGS'],
      })
      cy.signIn()
    })
    cy.task('stubQuickLook', quickLookFullDetails)
    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
    })
  })

  it('Should display conditionally displayed links to other pages', () => {
    cy.visit(`/prisoner/${offenderNo}`)

    cy.get('[data-test="tabs-case-notes"]').should('contain.text', 'Case notes')
    cy.get('[data-test="incentive-details-link"]').should('contain.text', 'View incentive level details')
  })
})
