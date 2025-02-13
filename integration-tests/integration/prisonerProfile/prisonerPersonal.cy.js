const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { clickIfExist } = require('../../test-helpers')
const {
  NeurodivergenceSelfDeclared,
  NeurodivergenceAssessed,
  NeurodivergenceSupport,
} = require('../../../backend/api/curious/types/Enums')

context('Prisoner personal', () => {
  const offenderNo = 'A12345'
  const nextOfKin = [
    {
      lastName: 'SMITH',
      firstName: 'JOHN',
      contactType: 'S',
      contactTypeDescription: 'Social/Family',
      relationship: 'COU',
      relationshipDescription: 'Cousin',
      emergencyContact: true,
      nextOfKin: true,
      relationshipId: 1,
      personId: 12345,
      activeFlag: true,
      approvedVisitorFlag: false,
      canBeContactedFlag: false,
      awareOfChargesFlag: false,
      contactRootOffenderId: 0,
      bookingId: 123,
    },
    {
      lastName: 'JONES',
      firstName: 'TERRY',
      contactType: 'S',
      contactTypeDescription: 'Social/Family',
      relationship: 'OTHER',
      relationshipDescription: 'Other - Social',
      emergencyContact: true,
      nextOfKin: true,
      relationshipId: 2,
      personId: 67890,
      activeFlag: false,
      approvedVisitorFlag: false,
      canBeContactedFlag: false,
      awareOfChargesFlag: false,
      contactRootOffenderId: 0,
      bookingId: 123,
    },
  ]
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

  const visitPersonalAndExpandAccordions = () => {
    cy.visit(`/prisoner/${offenderNo}/personal`)
    clickIfExist('.govuk-accordion__open-all[aria-expanded="false"]') // Not needed to check values but useful for viewing cypress snapshots
  }

  beforeEach(() => {
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: null, caseloads: [] })
    cy.session('hmpps-session-dev', () => {
      cy.clearCookies()
      cy.signIn()
    })
    cy.task('stubPathFinderOffenderDetails', null)
    cy.task('stubClientCredentialsRequest')
  })

  context('When there is no data', () => {
    const notEnteredText = 'Not entered'

    beforeEach(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
        offenderNo,
      })
      cy.task('stubPersonal', {})
      visitPersonalAndExpandAccordions()
    })

    context('Personal section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="personal-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 15)
              expect($summaryLabels.get(0)).to.contain('Age')
              expect($summaryLabels.get(1)).to.contain('Date of Birth')
              expect($summaryLabels.get(2)).to.contain('Place of Birth')
              expect($summaryLabels.get(3)).to.contain('Sex')
              expect($summaryLabels.get(4)).to.contain('Ethnicity')
              expect($summaryLabels.get(5)).to.contain('Religion or belief')
              expect($summaryLabels.get(6)).to.contain('Nationality')
              expect($summaryLabels.get(7)).to.contain('Sexual orientation')
              expect($summaryLabels.get(8)).to.contain('Marital status')
              expect($summaryLabels.get(9)).to.contain('Number of children')
              expect($summaryLabels.get(10)).to.contain('Smoker or vaper')
              expect($summaryLabels.get(11)).to.contain('Interest to immigration')
              expect($summaryLabels.get(12)).to.contain('Warned about tattooing')
              expect($summaryLabels.get(13)).to.contain('Warned not to change appearance')
              expect($summaryLabels.get(14)).to.contain('Property')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 15)
              expect($summaryValues.get(0)).to.contain(notEnteredText)
              expect($summaryValues.get(1)).to.contain(notEnteredText)
              expect($summaryValues.get(2)).to.contain(notEnteredText)
              expect($summaryValues.get(3)).to.contain(notEnteredText)
              expect($summaryValues.get(4)).to.contain(notEnteredText)
              expect($summaryValues.get(5)).to.contain(notEnteredText)
              expect($summaryValues.get(6)).to.contain(notEnteredText)
              expect($summaryValues.get(7)).to.contain(notEnteredText)
              expect($summaryValues.get(8)).to.contain(notEnteredText)
              expect($summaryValues.get(9)).to.contain(notEnteredText)
              expect($summaryValues.get(10)).to.contain(notEnteredText)
              expect($summaryValues.get(11)).to.contain(notEnteredText)
              expect($summaryValues.get(12)).to.contain('Needs to be warned')
              expect($summaryValues.get(13)).to.contain('Needs to be warned')
              expect($summaryValues.get(14)).to.contain('None')
            })
        })
      })
    })

    context('Physical characteristics section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="physical-characteristics-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 9)
              expect($summaryLabels.get(0)).to.contain('Height')
              expect($summaryLabels.get(1)).to.contain('Weight')
              expect($summaryLabels.get(2)).to.contain('Hair colour')
              expect($summaryLabels.get(3)).to.contain('Left eye colour')
              expect($summaryLabels.get(4)).to.contain('Right eye colour')
              expect($summaryLabels.get(5)).to.contain('Facial hair')
              expect($summaryLabels.get(6)).to.contain('Shape of face')
              expect($summaryLabels.get(7)).to.contain('Build')
              expect($summaryLabels.get(8)).to.contain('Shoe size')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 9)
              expect($summaryValues.get(0)).to.contain(notEnteredText)
              expect($summaryValues.get(1)).to.contain(notEnteredText)
              expect($summaryValues.get(2)).to.contain(notEnteredText)
              expect($summaryValues.get(3)).to.contain(notEnteredText)
              expect($summaryValues.get(4)).to.contain(notEnteredText)
              expect($summaryValues.get(5)).to.contain(notEnteredText)
              expect($summaryValues.get(6)).to.contain(notEnteredText)
              expect($summaryValues.get(7)).to.contain(notEnteredText)
              expect($summaryValues.get(8)).to.contain(notEnteredText)
            })
        })
      })
    })

    context('Distinguishing marks section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="distinguishing-marks-summary"]').then(($section) => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Disabilities and adjustments section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="neurodiversity-summary"]').then(($section) => {
          expect($section).to.contain.text(
            'DPS currently includes neurodiversity information recorded for prisoners in HMPs Bristol, Lincoln, New Hall and Swaleside.'
          )
        })
        cy.get('[data-test="care-needs-summary"]').then(($section) => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Languages section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="languages-summary"]').then(($section) => {
          expect($section).to.contain.text('No language entered')
        })
      })
    })

    context('Aliases section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="aliases-summary"]').then(($section) => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Identifiers section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="identifiers-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 1)
              expect($summaryLabels.get(0)).to.contain('PNC number')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 1)
              expect($summaryValues.get(0)).to.contain(notEnteredText)
            })
        })
      })
    })

    context("Prisoner's addresses section", () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="addresses-summary"]').then(($section) => {
          expect($section).to.contain.text('No active, primary address entered')
        })
      })
    })

    context('Personal contacts section', () => {
      context('When there is no data at all', () => {
        it('Should show correct missing content text', () => {
          cy.get('[data-test="personal-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('p')
              .then(($text) => {
                cy.get($text).its('length').should('eq', 1)
                expect($text.get(0)).to.contain('None')
              })
          })

          cy.get('[data-test="professional-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('p')
              .then(($text) => {
                cy.get($text).its('length').should('eq', 1)
                expect($text.get(0)).to.contain('None')
              })
          })
        })
      })

      context('When there is some but not all data', () => {
        beforeEach(() => {
          cy.task('stubPrisonerProfileHeaderData', {
            offenderBasicDetails,
            offenderFullDetails,
            iepSummary: {},
            caseNoteSummary: {},
            offenderNo,
          })

          cy.task('stubPersonal', {
            contacts: { nextOfKin },
          })
          visitPersonalAndExpandAccordions()
        })

        it('Should show correct missing value text', () => {
          cy.get('[data-test="personal-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 1)
                expect($headings.get(0)).to.contain('John Smith')
              })

            cy.get($section)
              .find('p')
              .then(($text) => {
                cy.get($text).its('length').should('eq', 2)
                expect($text.get(0)).to.contain('Next of kin')
                expect($text.get(1)).to.contain('Emergency contact')
              })

            cy.get($section)
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 6)
                expect($summaryLabels.get(0)).to.contain('Relationship')
                expect($summaryLabels.get(1)).to.contain('Address')
                expect($summaryLabels.get(2)).to.contain('Town')
                expect($summaryLabels.get(3)).to.contain('Postcode')
                expect($summaryLabels.get(4)).to.contain('Address phone')
                expect($summaryLabels.get(5)).to.contain('Address type')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 6)
                expect($summaryValues.get(0)).to.contain('Cousin')
                expect($summaryValues.get(1)).to.contain(notEnteredText)
                expect($summaryValues.get(2)).to.contain(notEnteredText)
                expect($summaryValues.get(3)).to.contain(notEnteredText)
                expect($summaryValues.get(4)).to.contain(notEnteredText)
                expect($summaryValues.get(5)).to.contain(notEnteredText)
              })
          })
        })
      })
    })

    context('Professional contacts section', () => {
      context('When there is no data at all', () => {
        it('Should show correct missing content text', () => {
          cy.get('[data-test="professional-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('p')
              .then(($text) => {
                cy.get($text).its('length').should('eq', 1)
                expect($text.get(0)).to.contain('None')
              })
          })
        })
      })

      context('When there is some but not all data', () => {
        beforeEach(() => {
          cy.task('stubPrisonerProfileHeaderData', {
            offenderBasicDetails,
            offenderFullDetails,
            iepSummary: {},
            caseNoteSummary: {},
            offenderNo,
          })

          cy.task('stubPersonal', {
            contacts: { otherContacts },
          })
          visitPersonalAndExpandAccordions()
        })

        it('Should show correct missing value text', () => {
          cy.get('[data-test="professional-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 5)
                expect($headings.get(0)).to.contain('Trevor Smith')
                expect($headings.get(1)).to.contain('Uriualche Lydyle')
                expect($headings.get(2)).to.contain('Anne Jones')
                expect($headings.get(3)).to.contain('Anne Jones')
                expect($headings.get(4)).to.contain('Areneng Kimbur')
              })

            cy.get($section)
              .find('p')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 5)
                expect($summaryValues.get(0)).to.contain('Case Administrator')
                expect($summaryValues.get(1)).to.contain('Case Administrator')
                expect($summaryValues.get(2)).to.contain('Community Offender Manager')
                expect($summaryValues.get(3)).to.contain('Offender Supervisor')
                expect($summaryValues.get(4)).to.contain('Probation Officer')
              })

            cy.get($section)
              .find('a')
              .then(($contactsUrl) => {
                cy.get($contactsUrl).its('length').should('eq', 1)
                expect($contactsUrl.get(0)).to.contain('View all professional contacts and their contact details')
              })
          })

          cy.get('[data-test="personal-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('p')
              .then(($text) => {
                cy.get($text).its('length').should('eq', 1)
                expect($text.get(0)).to.contain('None')
              })
          })
        })
      })
    })
  })

  context('When there is data', () => {
    const primaryAddress = {
      addressType: 'HOME',
      flat: 'A',
      premise: '13',
      street: 'High Street',
      town: 'Ulverston',
      postalCode: 'LS1 AAA',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: true,
      noFixedAddress: false,
      startDate: '2020-05-01',
      phones: [{ number: '011111111111', type: 'MOB' }],
      addressUsages: [
        {
          addressId: 123,
          addressUsage: 'DAP',
          addressUsageDescription: 'Discharge - Approved Premises',
          activeFlag: false,
        },
        {
          addressId: 123,
          addressUsage: 'HDC',
          addressUsageDescription: 'HDC Address',
          activeFlag: true,
        },
        {
          addressId: 123,
          addressUsage: 'HOST',
          addressUsageDescription: 'Approved Premises',
          activeFlag: true,
        },
      ],
    }
    const nonPrimaryAddress = {
      addressType: 'HOME',
      flat: 'B',
      premise: '13',
      street: 'Another Street',
      town: 'Leeds',
      postalCode: 'LS2 BBB',
      county: 'West Yorkshire',
      country: 'England',
      comment: 'address comment field',
      primary: false,
      noFixedAddress: false,
      startDate: '2020-05-01',
      phones: [{ number: '011111111111', type: 'MOB' }],
      addressUsages: [],
    }

    const headerDetails = {
      offenderBasicDetails,
      offenderFullDetails: {
        ...offenderFullDetails,
        interpreterRequired: true,
        language: 'English',
        writtenLanguage: 'Russian',
        dateOfBirth: '1990-10-12',
        age: 29,
        birthPlace: 'DONCASTER',
        physicalAttributes: {
          gender: 'Male',
          ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
          raceCode: 'W1',
          heightMetres: 1.91,
          weightKilograms: 86,
        },
        physicalCharacteristics: [
          { type: 'HAIR', detail: 'Brown' },
          { type: 'R_EYE_C', detail: 'Green' },
          { type: 'L_EYE_C', detail: 'Blue' },
          { type: 'FACIAL_HAIR', detail: 'Moustache' },
          { type: 'FACE', detail: 'Round' },
          { type: 'BUILD', detail: 'Athletic' },
          { type: 'SHOESIZE', detail: '12' },
        ],
        physicalMarks: [
          { type: 'Tattoo', side: 'Left', bodyPart: 'Arm', comment: 'Childs name', orentiation: 'Facing up' },
          {
            type: 'Tattoo',
            side: 'Right',
            bodyPart: 'Arm',
            comment: 'Face',
            orentiation: 'Facing down',
            imageId: 123,
          },
        ],
        profileInformation: [
          { type: 'RELF', resultValue: 'Christian' },
          { type: 'NAT', resultValue: 'British' },
          { type: 'SEXO', resultValue: 'Hetrosexual' },
          { type: 'MARITAL', resultValue: 'Single-not married/in civil partnership' },
          { type: 'CHILD', resultValue: 2 },
          { type: 'SMOKE', resultValue: 'Yes' },
          { type: 'DIET', resultValue: 'Religion - Muslim' },
          { type: 'IMM', resultValue: 'Yes' },
          { type: 'TRAVEL', resultValue: 'Cannot travel to Sheffield' },
          { type: 'PERSC', resultValue: 'Yes' },
          { type: 'YOUTH', resultValue: 'Yes' },
          { type: 'DNA', resultValue: 'Yes' },
          { type: 'TAT', resultValue: 'Yes' },
          { type: 'APPEAR', resultValue: 'Yes' },
        ],
      },
      iepSummary: {},
      caseNoteSummary: {},
      offenderNo,
    }

    context('When each section is correctly populated', () => {
      const addresses = [primaryAddress, nonPrimaryAddress]

      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          property: [
            {
              containerType: 'Valuables',
              location: { userDescription: 'Property Box 123' },
              sealMark: 123,
            },
            {
              containerType: 'Bulk',
              location: { userDescription: 'Property Box 456' },
              sealMark: 456,
            },
          ],
          secondaryLanguages: [
            {
              canRead: true,
              canSpeak: true,
              canWrite: true,
              code: 'ENG',
              description: 'English',
            },
          ],
          aliases: [
            { firstName: 'First', lastName: 'Alias', dob: '1985-08-31' },
            { firstName: 'Second', lastName: 'Alias', dob: '1986-05-20' },
          ],
          identifiers: [
            { type: 'PNC', value: '1234' },
            { type: 'CRO', value: '2345' },
            { type: 'NINO', value: '3456' },
            { type: 'HOREF', value: '4567' },
            { type: 'DL', value: '5678' },
          ],
          addresses,
          contacts: {
            nextOfKin,
            otherContacts,
          },
          personAddresses: addresses,
          personEmails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
          personPhones: [
            { number: '02222222222', type: 'MOB' },
            { number: '033333333333', type: 'BUS', ext: '123' },
          ],
          treatmentTypes: [
            {
              domain: 'HEALTH_TREAT',
              code: 'AMP TEL',
              description: 'Amplified telephone',
            },
            {
              domain: 'HEALTH_TREAT',
              code: 'FLEX_REFRESH',
              description: 'Flexible refreshment breaks',
            },
          ],
          healthTypes: [
            {
              domain: 'HEALTH',
              code: 'DISAB',
              description: 'Disability',
            },
            {
              domain: 'HEALTH',
              code: 'PSYCH',
              description: 'Psychological',
            },
          ],
          neurodiversities: [
            {
              prn: 'G6123VU',
              establishmentId: 'MDI',
              establishmentName: 'HMP Moorland',
              uln: '1234123412',
              lddHealthProblem:
                'Learner considers himself or herself to have a learning difficulty and/or disability and/or health problem.',
              priorAttainment: 'Full level 3',
              qualifications: [
                {
                  qualificationType: 'English',
                  qualificationGrade: 'Level 1',
                  assessmentDate: '2021-05-13',
                },
                {
                  qualificationType: 'Maths',
                  qualificationGrade: 'Level 1',
                  assessmentDate: '2021-05-20',
                },
                {
                  qualificationType: 'Digital Literacy',
                  qualificationGrade: 'Level 2',
                  assessmentDate: '2021-05-19',
                },
              ],
              languageStatus: 'English',
              plannedHours: 200,
              rapidAssessmentDate: null,
              inDepthAssessmentDate: null,
              primaryLDDAndHealthProblem: 'Visual impairment',
              additionalLDDAndHealthProblems: [
                'Hearing impairment',
                'Social and emotional difficulties',
                'Mental health difficulty',
              ],
            },
          ],
          careNeeds: {
            personalCareNeeds: [
              {
                problemType: 'DISAB',
                problemCode: 'ND',
                problemStatus: null,
                problemDescription: 'No Disability',
                commentText: null,
                startDate: '2013-10-29',
                endDate: null,
              },
              {
                problemType: 'PSYCH',
                problemCode: 'BIP',
                problemStatus: 'ON',
                problemDescription: 'Bi-Polar',
                commentText: 'Bi polar comment text',
                startDate: '2020-05-19',
                endDate: null,
              },
              {
                problemType: 'PHY',
                problemCode: 'ASTH',
                problemStatus: 'ON',
                problemDescription: 'Asthmatic',
                commentText: 'Asthmatic comment text',
                startDate: '2020-05-01',
                endDate: null,
              },
            ],
          },
          reasonableAdjustments: {
            reasonableAdjustments: [
              {
                treatmentCode: 'AMP TEL',
                commentText: 'Amped telephone comment',
                startDate: '2020-05-19',
                endDate: null,
                agencyId: 'MDI',
                agencyDescription: 'Moorland (HMP & YOI)',
              },
              {
                treatmentCode: 'FLEX_REFRESH',
                commentText: 'Flexible drinks comments',
                startDate: '2020-05-01',
                endDate: null,
                agencyId: 'MDI',
                agencyDescription: 'Moorland (HMP & YOI)',
              },
            ],
          },
          prisonOffenderManagers: {
            primary_pom: { staffId: 1, name: 'SMITH, JANE' },
            secondary_pom: { staffId: 2, name: 'John doe' },
          },
        })

        visitPersonalAndExpandAccordions()
      })
      context('Personal section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="personal-summary"]').then(($summary) => {
            cy.get($summary)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 25)
                expect($summaryLabels.get(0)).to.contain('Age')
                expect($summaryLabels.get(1)).to.contain('Date of Birth')
                expect($summaryLabels.get(2)).to.contain('Place of Birth')
                expect($summaryLabels.get(3)).to.contain('Sex')
                expect($summaryLabels.get(4)).to.contain('Ethnicity')
                expect($summaryLabels.get(5)).to.contain('Religion or belief')
                expect($summaryLabels.get(6)).to.contain('Nationality')
                expect($summaryLabels.get(7)).to.contain('Sexual orientation')
                expect($summaryLabels.get(8)).to.contain('Marital status')
                expect($summaryLabels.get(9)).to.contain('Number of children')
                expect($summaryLabels.get(10)).to.contain('Smoker or vaper')
                expect($summaryLabels.get(11)).to.contain('Type of diet')
                expect($summaryLabels.get(12)).to.contain('Interest to immigration')
                expect($summaryLabels.get(13)).to.contain('Travel restrictions')
                expect($summaryLabels.get(14)).to.contain('Social care needed')
                expect($summaryLabels.get(15)).to.contain('Youth offender')
                expect($summaryLabels.get(16)).to.contain('DNA required')
                expect($summaryLabels.get(17)).to.contain('Warned about tattooing')
                expect($summaryLabels.get(18)).to.contain('Warned not to change appearance')
                expect($summaryLabels.get(19)).to.contain('Property')
                expect($summaryLabels.get(20)).to.contain('Seal mark')
                expect($summaryLabels.get(21)).to.contain('Location')
                expect($summaryLabels.get(22)).to.contain('Property')
                expect($summaryLabels.get(23)).to.contain('Seal mark')
                expect($summaryLabels.get(24)).to.contain('Location')
              })

            cy.get($summary)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 25)
                expect($summaryValues.get(0)).to.contain('29')
                expect($summaryValues.get(1)).to.contain('12/10/1990')
                expect($summaryValues.get(2)).to.contain('Doncaster')
                expect($summaryValues.get(3)).to.contain('Male')
                expect($summaryValues.get(4)).to.contain('White: Eng./Welsh/Scot./N.Irish/British (W1)')
                expect($summaryValues.get(5)).to.contain('Christian')
                expect($summaryValues.get(6)).to.contain('British')
                expect($summaryValues.get(7)).to.contain('Hetrosexual')
                expect($summaryValues.get(8)).to.contain('Single-not married/in civil partnership')
                expect($summaryValues.get(9)).to.contain('2')
                expect($summaryValues.get(10)).to.contain('Yes')
                expect($summaryValues.get(11)).to.contain('Religion - Muslim')
                expect($summaryValues.get(12)).to.contain('Yes')
                expect($summaryValues.get(13)).to.contain('Cannot travel to Sheffield')
                expect($summaryValues.get(14)).to.contain('Yes')
                expect($summaryValues.get(15)).to.contain('Yes')
                expect($summaryValues.get(16)).to.contain('Yes')
                expect($summaryValues.get(17)).to.contain('Yes')
                expect($summaryValues.get(18)).to.contain('Yes')
                expect($summaryValues.get(19)).to.contain('Valuables')
                expect($summaryValues.get(20)).to.contain('123')
                expect($summaryValues.get(21)).to.contain('Property Box 123')
                expect($summaryValues.get(22)).to.contain('Bulk')
                expect($summaryValues.get(23)).to.contain('456')
                expect($summaryValues.get(24)).to.contain('Property Box 456')
              })
          })
        })
      })

      context('Physical characteristics section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="physical-characteristics-summary"]').then(($summary) => {
            cy.get($summary)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 9)
                expect($summaryLabels.get(0)).to.contain('Height')
                expect($summaryLabels.get(1)).to.contain('Weight')
                expect($summaryLabels.get(2)).to.contain('Hair colour')
                expect($summaryLabels.get(3)).to.contain('Left eye colour')
                expect($summaryLabels.get(4)).to.contain('Right eye colour')
                expect($summaryLabels.get(5)).to.contain('Facial hair')
                expect($summaryLabels.get(6)).to.contain('Shape of face')
                expect($summaryLabels.get(7)).to.contain('Build')
                expect($summaryLabels.get(8)).to.contain('Shoe size')
              })

            cy.get($summary)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 9)
                expect($summaryValues.get(0)).to.contain('1.91m')
                expect($summaryValues.get(1)).to.contain('86kg')
                expect($summaryValues.get(2)).to.contain('Brown')
                expect($summaryValues.get(3)).to.contain('Blue')
                expect($summaryValues.get(4)).to.contain('Green')
                expect($summaryValues.get(5)).to.contain('Moustache')
                expect($summaryValues.get(6)).to.contain('Round')
                expect($summaryValues.get(7)).to.contain('Athletic')
                expect($summaryValues.get(8)).to.contain('12')
              })
          })
        })
      })

      context('Distinguishing marks section', () => {
        it('Should show correct headings, images, labels and values', () => {
          cy.get('[data-test="distinguishing-marks-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 2)
                expect($headings.get(0)).to.contain('Tattoo')
                expect($headings.get(1)).to.contain('Tattoo')
              })

            cy.get($section).find('img').should('have.attr', 'src').should('include', '/app/image/123/data')

            cy.get($section)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 8)
                expect($summaryLabels.get(0)).to.contain('Body part')
                expect($summaryLabels.get(1)).to.contain('Side')
                expect($summaryLabels.get(2)).to.contain('Orientation')
                expect($summaryLabels.get(3)).to.contain('Comment')
                expect($summaryLabels.get(4)).to.contain('Body part')
                expect($summaryLabels.get(5)).to.contain('Side')
                expect($summaryLabels.get(6)).to.contain('Orientation')
                expect($summaryLabels.get(7)).to.contain('Comment')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 8)
                expect($summaryValues.get(0)).to.contain('Arm')
                expect($summaryValues.get(1)).to.contain('Left')
                expect($summaryValues.get(2)).to.contain('Facing up')
                expect($summaryValues.get(3)).to.contain('Childs name')
                expect($summaryValues.get(4)).to.contain('Arm')
                expect($summaryValues.get(5)).to.contain('Right')
                expect($summaryValues.get(6)).to.contain('Facing down')
                expect($summaryValues.get(7)).to.contain('Face')
              })
          })
        })
      })

      context('Care needs summary', () => {
        it('Should show correct headings and labels', () => {
          cy.get('[data-test="care-needs-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 3)
                expect($headings.get(0)).to.contain('Psychological Bi-Polar')
                expect($headings.get(1)).to.contain('Reasonable adjustment Flexible refreshment breaks')
                expect($headings.get(2)).to.contain('Reasonable adjustment Amplified telephone')
              })

            cy.get($section)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 9)
                expect($summaryLabels.get(0)).to.contain('Description')
                expect($summaryLabels.get(1)).to.contain('From')
                expect($summaryLabels.get(2)).to.contain('Status')
                expect($summaryLabels.get(3)).to.contain('Establishment')
                expect($summaryLabels.get(4)).to.contain('Date provided')
                expect($summaryLabels.get(5)).to.contain('Comment')
                expect($summaryLabels.get(6)).to.contain('Establishment')
                expect($summaryLabels.get(7)).to.contain('Date provided')
                expect($summaryLabels.get(8)).to.contain('Comment')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 9)
                expect($summaryValues.get(0)).to.contain('Bi polar comment text')
                expect($summaryValues.get(1)).to.contain('19 May 2020')
                expect($summaryValues.get(2)).to.contain('Ongoing')
                expect($summaryValues.get(3)).to.contain('Moorland (HMP & YOI)')
                expect($summaryValues.get(4)).to.contain('01 May 2020')
                expect($summaryValues.get(5)).to.contain('Flexible drinks comments')
                expect($summaryValues.get(6)).to.contain('Moorland (HMP & YOI)')
                expect($summaryValues.get(7)).to.contain('19 May 2020')
                expect($summaryValues.get(8)).to.contain('Amped telephone comment')
              })
          })
        })
      })

      context('Languages section', () => {
        it('Should show correct languages content', () => {
          //  cy.get('[id^=prisoner-accordion-content-1]').click()
          cy.get('[data-test="languages-summary"]').then(($section) => {
            cy.get($section)
              .find('[data-test="language-speaks-different"]')
              .should('contain.text', '\n        English  - interpreter required \n    ')

            cy.get($section).find('[data-test="language-written-different"]').should('contain.text', 'Russian (writes)')

            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 1)
                expect($headings.get(0)).to.contain('Other languages')
              })

            cy.get($section)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 1)
                expect($summaryLabels.get(0)).to.contain('English')
              })
          })
        })
      })

      context('Aliases section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="aliases-summary"]').then(($section) => {
            cy.get($section)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 2)
                expect($summaryLabels.get(0)).to.contain('Alias, First')
                expect($summaryLabels.get(1)).to.contain('Alias, Second')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 2)
                expect($summaryValues.get(0)).to.contain('31/08/1985')
                expect($summaryValues.get(1)).to.contain('20/05/1986')
              })
          })
        })
      })

      context('Identifiers section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="identifiers-summary"]').then(($summary) => {
            cy.get($summary)
              .find('dl')
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 5)
                expect($summaryLabels.get(0)).to.contain('PNC number')
                expect($summaryLabels.get(1)).to.contain('CRO number')
                expect($summaryLabels.get(2)).to.contain('National insurance number')
                expect($summaryLabels.get(3)).to.contain('Home office reference number')
                expect($summaryLabels.get(4)).to.contain('Driving licence number')
              })

            cy.get($summary)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 5)
                expect($summaryValues.get(0)).to.contain('1234')
                expect($summaryValues.get(1)).to.contain('2345')
                expect($summaryValues.get(2)).to.contain('3456')
                expect($summaryValues.get(3)).to.contain('4567')
                expect($summaryValues.get(4)).to.contain('5678')
              })
          })
        })
      })

      context('Addresses section', () => {
        it('Should show correct headings, labels and values', () => {
          cy.get('[data-test="addresses-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 1)
                expect($headings.get(0)).to.contain('Primary address')
              })

            cy.get($section)
              .find('[data-test="address-type"]')
              .then(($addressTypes) => {
                cy.get($addressTypes).its('length').should('eq', 2)
                expect($addressTypes.get(0)).to.contain('HDC Address')
                expect($addressTypes.get(1)).to.contain('Approved Premises')
              })

            cy.get($section)
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 8)
                expect($summaryLabels.get(0)).to.contain('Address')
                expect($summaryLabels.get(1)).to.contain('Town')
                expect($summaryLabels.get(2)).to.contain('County')
                expect($summaryLabels.get(3)).to.contain('Postcode')
                expect($summaryLabels.get(4)).to.contain('Country')
                expect($summaryLabels.get(5)).to.contain('Phone')
                expect($summaryLabels.get(6)).to.contain('Added')
                expect($summaryLabels.get(7)).to.contain('Comments')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 8)
                expect($summaryValues.get(0)).to.contain('Flat A, 13, High Street')
                expect($summaryValues.get(1)).to.contain('Ulverston')
                expect($summaryValues.get(2)).to.contain('West Yorkshire')
                expect($summaryValues.get(3)).to.contain('LS1 AAA')
                expect($summaryValues.get(4)).to.contain('England')
                expect($summaryValues.get(5)).to.contain('011111111111')
                expect($summaryValues.get(6)).to.contain('May 2020')
                expect($summaryValues.get(7)).to.contain('address comment field')
              })
          })
        })
      })

      context('Personal contacts section', () => {
        it('Should show correct headings, labels and values', () => {
          cy.get('[data-test="personal-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 1)
                expect($headings.get(0)).to.contain('John Smith')
              })

            cy.get($section)
              .find('p')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 2)
                expect($headings.get(0)).to.contain('Next of kin')
                expect($headings.get(1)).to.contain('Emergency contact')
              })

            cy.get($section)
              .find('dt')
              .then(($summaryLabels) => {
                cy.get($summaryLabels).its('length').should('eq', 10)
                expect($summaryLabels.get(0)).to.contain('Relationship')
                expect($summaryLabels.get(1)).to.contain('Phone number')
                expect($summaryLabels.get(2)).to.contain('Email')
                expect($summaryLabels.get(3)).to.contain('Address')
                expect($summaryLabels.get(4)).to.contain('Town')
                expect($summaryLabels.get(5)).to.contain('County')
                expect($summaryLabels.get(6)).to.contain('Postcode')
                expect($summaryLabels.get(7)).to.contain('Country')
                expect($summaryLabels.get(8)).to.contain('Address phone')
                expect($summaryLabels.get(9)).to.contain('Address type')
              })

            cy.get($section)
              .find('dd')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 10)
                expect($summaryValues.get(0)).to.contain('Cousin')
                expect($summaryValues.get(1)).to.contain('02222222222,033333333333 extension number 123')
                expect($summaryValues.get(2)).to.contain('test1@email.com, test2@email.com')
                expect($summaryValues.get(3)).to.contain('Flat A, 13, High Street')
                expect($summaryValues.get(4)).to.contain('Ulverston')
                expect($summaryValues.get(5)).to.contain('West Yorkshire')
                expect($summaryValues.get(6)).to.contain('LS1 AAA')
                expect($summaryValues.get(7)).to.contain('England')
                expect($summaryValues.get(8)).to.contain('011111111111')
                expect($summaryValues.get(9)).to.contain('Home')
              })
          })
        })
      })

      context('Professional contacts section', () => {
        it('Should show correct headings, labels and values', () => {
          cy.get('[data-test="professional-contacts-summary"]').then(($section) => {
            cy.get($section)
              .find('h3')
              .then(($headings) => {
                cy.get($headings).its('length').should('eq', 7)
                expect($headings.get(0)).to.contain('Trevor Smith')
                expect($headings.get(1)).to.contain('Uriualche Lydyle')
                expect($headings.get(2)).to.contain('Anne Jones')
                expect($headings.get(3)).to.contain('Anne Jones')
                expect($headings.get(4)).to.contain('Jane Smith')
                expect($headings.get(5)).to.contain('John Doe')
                expect($headings.get(6)).to.contain('Areneng Kimbur')
              })

            cy.get($section)
              .find('p')
              .then(($summaryValues) => {
                cy.get($summaryValues).its('length').should('eq', 7)
                expect($summaryValues.get(0)).to.contain('Case Administrator')
                expect($summaryValues.get(1)).to.contain('Case Administrator')
                expect($summaryValues.get(2)).to.contain('Community Offender Manager')
                expect($summaryValues.get(3)).to.contain('Offender Supervisor')
                expect($summaryValues.get(4)).to.contain('Prison Offender Manager')
                expect($summaryValues.get(5)).to.contain('Prison Offender Manager Co-worker')
                expect($summaryValues.get(6)).to.contain('Probation Officer')
              })

            cy.get($section)
              .find('a')
              .then(($contactsUrl) => {
                cy.get($contactsUrl).its('length').should('eq', 1)
                expect($contactsUrl.get(0)).to.contain('View all professional contacts and their contact details')
              })
          })
        })
      })
    })

    context('When there is no fixed abode for a prisoner', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', { addresses: [{ ...primaryAddress, noFixedAddress: true }] })
        visitPersonalAndExpandAccordions()
      })

      it('Should show the correct content in the address section', () => {
        cy.get('[data-test="addresses-summary"]').then(($section) => {
          cy.get($section)
            .find('h3')
            .then(($headings) => {
              cy.get($headings).its('length').should('eq', 1)
              expect($headings.get(0)).to.contain('Primary address')
            })

          cy.get($section).find('[data-test="no-fixed-abode"]').should('have.text', 'No fixed abode')
        })
      })
    })

    context('When there is no fixed abode for contacts', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          personAddresses: [{ ...primaryAddress, noFixedAddress: true }],
          contacts: { nextOfKin, otherContacts },
        })
        visitPersonalAndExpandAccordions()
      })

      it('Should show the correct content in the active contacts section', () => {
        cy.get('[data-test="personal-contacts-summary"]').then(($section) => {
          cy.get($section)
            .find('h3')
            .then(($headings) => {
              cy.get($headings).its('length').should('eq', 1)
              expect($headings.get(0)).to.contain('John Smith')
            })

          cy.get($section)
            .find('p')
            .then(($text) => {
              cy.get($text).its('length').should('eq', 3)
              expect($text.get(0)).to.contain('Next of kin')
              expect($text.get(1)).to.contain('Emergency contact')
              expect($text.get(2)).to.contain('No fixed abode')
            })

          cy.get($section)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 1)
              expect($summaryLabels.get(0)).to.contain('Relationship')
            })

          cy.get($section)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 1)
              expect($summaryValues.get(0)).to.contain('Cousin')
            })
        })
      })
    })

    context('Neurodivergence data - all', () => {
      const neurodivergenceAll = {
        prn: 'A12345',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        neurodivergenceSelfDeclared: [NeurodivergenceSelfDeclared.ADHD, NeurodivergenceSelfDeclared.Autism],
        selfDeclaredDate: '2022-02-10',
        neurodivergenceAssessed: [NeurodivergenceAssessed.AcquiredBrainInjury],
        assessmentDate: '2022-02-15',
        neurodivergenceSupport: [NeurodivergenceSupport.MemorySupport, NeurodivergenceSupport.Reading],
        supportDate: '2022-02-20',
      }

      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          neurodivergence: [neurodivergenceAll],
        })
        visitPersonalAndExpandAccordions()
      })

      it('Should list all neurodivergence info for learner', () => {
        cy.get('[data-test="neurodiversity-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 5)
              expect($summaryLabels.get(0)).to.contain('Support needed')
              expect($summaryLabels.get(1)).to.contain('Neurodiversity')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 5)
              expect($summaryValues.get(0)).to.contain('Memory Support').and.to.contain('Reading Support')
              expect($summaryValues.get(1)).to.contain('From self-assessment')
              expect($summaryValues.get(2)).to.contain('ADHD').and.to.contain('Autism')
              expect($summaryValues.get(3)).to.contain('From neurodiversity assessment')
              expect($summaryValues.get(4))
                .to.contain('Acquired Brain Injury')
                .and.to.contain('Recorded on 15 February 2022')
            })
        })
      })
    })

    context('Neurodivergence - from assessment', () => {
      const neurodivergenceAssessed = {
        prn: 'A12345',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        neurodivergenceAssessed: [NeurodivergenceAssessed.Alzheimers],
        assessmentDate: '2022-02-15',
        neurodivergenceSupport: [NeurodivergenceSupport.MemorySupport],
        supportDate: '2022-02-20',
      }

      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          neurodivergence: [neurodivergenceAssessed],
        })
        visitPersonalAndExpandAccordions()
      })

      it('Should only list support and assessed neurodivergence info for learner', () => {
        cy.get('[data-test="neurodiversity-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 5)
              expect($summaryLabels.get(0)).to.contain('Support needed')
              expect($summaryLabels.get(1)).to.contain('Neurodiversity')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 5)
              expect($summaryValues.get(0)).to.contain('Memory Support')
              expect($summaryValues.get(1)).to.contain('From self-assessment')
              expect($summaryValues.get(2)).to.contain('No neurodiversity reported by the prisoner yet')
              expect($summaryValues.get(3)).to.contain('From neurodiversity assessment')
              expect($summaryValues.get(4)).to.contain('Alzheimers').and.to.contain('Recorded on 15 February 2022')
            })
        })
      })
    })

    context('Neurodivergence - self-declared', () => {
      const neurodivergenceSelfAssessed = {
        prn: 'A12345',
        establishmentId: 'MDI',
        establishmentName: 'HMP Moorland',
        neurodivergenceSelfDeclared: [NeurodivergenceSelfDeclared.Dyscalculia],
        selfDeclaredDate: '2022-02-15',
        neurodivergenceSupport: [NeurodivergenceSupport.SocialAndInteractionSupport],
        supportDate: '2022-02-20',
      }

      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          neurodivergence: [neurodivergenceSelfAssessed],
        })
        visitPersonalAndExpandAccordions()
      })

      it('Should only list support and self-declared neurodivergence info for learner', () => {
        cy.get('[data-test="neurodiversity-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 5)
              expect($summaryLabels.get(0)).to.contain('Support needed')
              expect($summaryLabels.get(1)).to.contain('Neurodiversity')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 5)
              expect($summaryValues.get(0))
                .to.contain('Social and interaction Support')
                .and.to.contain('Recorded on 20 February 2022')
              expect($summaryValues.get(1)).to.contain('From self-assessment')
              expect($summaryValues.get(2)).to.contain('Dyscalculia').and.to.contain('Recorded on 15 February 2022')
              expect($summaryValues.get(3)).to.contain('From neurodiversity assessment')
              expect($summaryValues.get(4)).to.contain('No neurodiversity identified yet')
            })
        })
      })
    })
    context('Neurodivergence - none entered', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          neurodivergence: [],
        })
        visitPersonalAndExpandAccordions()
      })

      it('Should list no neurodivergence info for learner', () => {
        cy.get('[data-test="neurodiversity-summary"]').then(($section) => {
          expect($section).to.contain.text(
            'DPS currently includes neurodiversity information recorded for prisoners in HMPs Bristol, Lincoln, New Hall and Swaleside.'
          )
        })
      })
    })
  })
})
