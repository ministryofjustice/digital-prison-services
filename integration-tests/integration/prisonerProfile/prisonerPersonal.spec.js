const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { clickIfExist } = require('../../test-helpers')

context('Prisoner personal', () => {
  const offenderNo = 'A12345'

  const visitPersonalAndExpandAccordions = () => {
    cy.visit(`/prisoner/${offenderNo}/personal`)
    clickIfExist('.govuk-accordion__open-all[aria-expanded="false"]') // Not needed to check values but useful for viewing cypress snapshots
  }

  before(() => {
    cy.clearCookies()
    cy.task('reset')
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('resetAndStubTokenVerification')
  })

  context('When there is no data', () => {
    const notEnteredText = 'Not entered'

    before(() => {
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: {},
        caseNoteSummary: {},
      })
      cy.task('stubPersonal', {})
      visitPersonalAndExpandAccordions()
    })

    context('Personal section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="personal-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 15)
              expect($summaryLabels.get(0).innerText).to.contain('Age')
              expect($summaryLabels.get(1).innerText).to.contain('Date of Birth')
              expect($summaryLabels.get(2).innerText).to.contain('Place of Birth')
              expect($summaryLabels.get(3).innerText).to.contain('Gender')
              expect($summaryLabels.get(4).innerText).to.contain('Ethnicity')
              expect($summaryLabels.get(5).innerText).to.contain('Religion or belief')
              expect($summaryLabels.get(6).innerText).to.contain('Nationality')
              expect($summaryLabels.get(7).innerText).to.contain('Sexual orientation')
              expect($summaryLabels.get(8).innerText).to.contain('Marital status')
              expect($summaryLabels.get(9).innerText).to.contain('Number of children')
              expect($summaryLabels.get(10).innerText).to.contain('Smoker or vaper')
              expect($summaryLabels.get(11).innerText).to.contain('Interest to immigration')
              expect($summaryLabels.get(12).innerText).to.contain('Warned about tattooing')
              expect($summaryLabels.get(13).innerText).to.contain('Warned not to change appearance')
              expect($summaryLabels.get(14).innerText).to.contain('Property')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 15)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(1).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(2).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(3).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(4).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(5).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(6).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(7).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(8).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(9).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(10).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(11).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(12).innerText).to.contain('Needs to be warned')
              expect($summaryValues.get(13).innerText).to.contain('Needs to be warned')
              expect($summaryValues.get(14).innerText).to.contain('None')
            })
        })
      })
    })

    context('Physical characteristics section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="physical-characteristics-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 9)
              expect($summaryLabels.get(0).innerText).to.contain('Height')
              expect($summaryLabels.get(1).innerText).to.contain('Weight')
              expect($summaryLabels.get(2).innerText).to.contain('Hair colour')
              expect($summaryLabels.get(3).innerText).to.contain('Left eye colour')
              expect($summaryLabels.get(4).innerText).to.contain('Right eye colour')
              expect($summaryLabels.get(5).innerText).to.contain('Facial hair')
              expect($summaryLabels.get(6).innerText).to.contain('Shape of face')
              expect($summaryLabels.get(7).innerText).to.contain('Build')
              expect($summaryLabels.get(8).innerText).to.contain('Shoe size')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 9)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(1).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(2).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(3).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(4).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(5).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(6).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(7).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(8).innerText).to.contain(notEnteredText)
            })
        })
      })
    })

    context('Distinguishing marks section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="distinguishing-marks-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Personal care needs section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="care-needs-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Languages section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="languages-summary"]').then($section => {
          expect($section).to.contain.text('No language entered')
        })
      })
    })

    context('Aliases section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="aliases-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Identifiers section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="identifiers-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 1)
              expect($summaryLabels.get(0).innerText).to.contain('PNC number')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 1)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
            })
        })
      })
    })

    context('Addresses section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="addresses-summary"]').then($section => {
          expect($section).to.contain.text('No active, primary address entered')
        })
      })
    })

    context('Active contacts section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="active-contacts-summary"]').then($section => {
          expect($section).to.contain.text('None')
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
      },
      iepSummary: {},
      caseNoteSummary: {},
    }

    context('When each section is correctly populated', () => {
      const addresses = [primaryAddress, nonPrimaryAddress]

      before(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', {
          prisonerDetail: {
            dateOfBirth: '1990-10-12',
            age: 29,
            birthPlace: 'DONCASTER',
            physicalAttributes: {
              gender: 'Male',
              ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
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
            nextOfKin: [
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
            ],
          },
          personAddresses: addresses,
          personEmails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
          personPhones: [{ number: '02222222222', type: 'MOB' }, { number: '033333333333', type: 'MOB' }],
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
              },
              {
                treatmentCode: 'FLEX_REFRESH',
                commentText: 'Flexible drinks comments',
                startDate: '2020-05-01',
                endDate: null,
                agencyId: 'MDI',
              },
            ],
          },
          agencies: [
            {
              agencyId: 'MDI',
              description: 'MOORLAND (HMP & YOI)',
            },
          ],
        })

        visitPersonalAndExpandAccordions()
      })
      context('Personal section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="personal-summary"]').then($summary => {
            cy.get($summary)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 25)
                expect($summaryLabels.get(0).innerText).to.contain('Age')
                expect($summaryLabels.get(1).innerText).to.contain('Date of Birth')
                expect($summaryLabels.get(2).innerText).to.contain('Place of Birth')
                expect($summaryLabels.get(3).innerText).to.contain('Gender')
                expect($summaryLabels.get(4).innerText).to.contain('Ethnicity')
                expect($summaryLabels.get(5).innerText).to.contain('Religion or belief')
                expect($summaryLabels.get(6).innerText).to.contain('Nationality')
                expect($summaryLabels.get(7).innerText).to.contain('Sexual orientation')
                expect($summaryLabels.get(8).innerText).to.contain('Marital status')
                expect($summaryLabels.get(9).innerText).to.contain('Number of children')
                expect($summaryLabels.get(10).innerText).to.contain('Smoker or vaper')
                expect($summaryLabels.get(11).innerText).to.contain('Type of diet')
                expect($summaryLabels.get(12).innerText).to.contain('Interest to immigration')
                expect($summaryLabels.get(13).innerText).to.contain('Travel restrictions')
                expect($summaryLabels.get(14).innerText).to.contain('Social care needed')
                expect($summaryLabels.get(15).innerText).to.contain('Youth offender')
                expect($summaryLabels.get(16).innerText).to.contain('DNA required')
                expect($summaryLabels.get(17).innerText).to.contain('Warned about tattooing')
                expect($summaryLabels.get(18).innerText).to.contain('Warned not to change appearance')
                expect($summaryLabels.get(19).innerText).to.contain('Property')
                expect($summaryLabels.get(20).innerText).to.contain('Seal mark')
                expect($summaryLabels.get(21).innerText).to.contain('Location')
                expect($summaryLabels.get(22).innerText).to.contain('Property')
                expect($summaryLabels.get(23).innerText).to.contain('Seal mark')
                expect($summaryLabels.get(24).innerText).to.contain('Location')
              })

            cy.get($summary)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 25)
                expect($summaryValues.get(0).innerText).to.contain('29')
                expect($summaryValues.get(1).innerText).to.contain('12/10/1990')
                expect($summaryValues.get(2).innerText).to.contain('Doncaster')
                expect($summaryValues.get(3).innerText).to.contain('Male')
                expect($summaryValues.get(4).innerText).to.contain('White: Eng./Welsh/Scot./N.Irish/British')
                expect($summaryValues.get(5).innerText).to.contain('Christian')
                expect($summaryValues.get(6).innerText).to.contain('British')
                expect($summaryValues.get(7).innerText).to.contain('Hetrosexual')
                expect($summaryValues.get(8).innerText).to.contain('Single-not married/in civil partnership')
                expect($summaryValues.get(9).innerText).to.contain('2')
                expect($summaryValues.get(10).innerText).to.contain('Yes')
                expect($summaryValues.get(11).innerText).to.contain('Religion - Muslim')
                expect($summaryValues.get(12).innerText).to.contain('Yes')
                expect($summaryValues.get(13).innerText).to.contain('Cannot travel to Sheffield')
                expect($summaryValues.get(14).innerText).to.contain('Yes')
                expect($summaryValues.get(15).innerText).to.contain('Yes')
                expect($summaryValues.get(16).innerText).to.contain('Yes')
                expect($summaryValues.get(17).innerText).to.contain('Yes')
                expect($summaryValues.get(18).innerText).to.contain('Yes')
                expect($summaryValues.get(19).innerText).to.contain('Valuables')
                expect($summaryValues.get(20).innerText).to.contain('123')
                expect($summaryValues.get(21).innerText).to.contain('Property Box 123')
                expect($summaryValues.get(22).innerText).to.contain('Bulk')
                expect($summaryValues.get(23).innerText).to.contain('456')
                expect($summaryValues.get(24).innerText).to.contain('Property Box 456')
              })
          })
        })
      })

      context('Physical characteristics section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="physical-characteristics-summary"]').then($summary => {
            cy.get($summary)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 9)
                expect($summaryLabels.get(0).innerText).to.contain('Height')
                expect($summaryLabels.get(1).innerText).to.contain('Weight')
                expect($summaryLabels.get(2).innerText).to.contain('Hair colour')
                expect($summaryLabels.get(3).innerText).to.contain('Left eye colour')
                expect($summaryLabels.get(4).innerText).to.contain('Right eye colour')
                expect($summaryLabels.get(5).innerText).to.contain('Facial hair')
                expect($summaryLabels.get(6).innerText).to.contain('Shape of face')
                expect($summaryLabels.get(7).innerText).to.contain('Build')
                expect($summaryLabels.get(8).innerText).to.contain('Shoe size')
              })

            cy.get($summary)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 9)
                expect($summaryValues.get(0).innerText).to.contain('1.91m')
                expect($summaryValues.get(1).innerText).to.contain('86kg')
                expect($summaryValues.get(2).innerText).to.contain('Brown')
                expect($summaryValues.get(3).innerText).to.contain('Blue')
                expect($summaryValues.get(4).innerText).to.contain('Green')
                expect($summaryValues.get(5).innerText).to.contain('Moustache')
                expect($summaryValues.get(6).innerText).to.contain('Round')
                expect($summaryValues.get(7).innerText).to.contain('Athletic')
                expect($summaryValues.get(8).innerText).to.contain('12')
              })
          })
        })
      })

      context('Distinguishing marks section', () => {
        it('Should show correct headings, images, labels and values', () => {
          cy.get('[data-test="distinguishing-marks-summary"]').then($section => {
            cy.get($section)
              .find('h3')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 2)
                expect($headings.get(0).innerText).to.contain('Tattoo')
                expect($headings.get(1).innerText).to.contain('Tattoo')
              })

            cy.get($section)
              .find('img')
              .should('have.attr', 'src')
              .should('include', '/app/image/123/data')

            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 8)
                expect($summaryLabels.get(0).innerText).to.contain('Body part')
                expect($summaryLabels.get(1).innerText).to.contain('Side')
                expect($summaryLabels.get(2).innerText).to.contain('Orientation')
                expect($summaryLabels.get(3).innerText).to.contain('Comment')
                expect($summaryLabels.get(4).innerText).to.contain('Body part')
                expect($summaryLabels.get(5).innerText).to.contain('Side')
                expect($summaryLabels.get(6).innerText).to.contain('Orientation')
                expect($summaryLabels.get(7).innerText).to.contain('Comment')
              })

            cy.get($section)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 8)
                expect($summaryValues.get(0).innerText).to.contain('Arm')
                expect($summaryValues.get(1).innerText).to.contain('Left')
                expect($summaryValues.get(2).innerText).to.contain('Facing up')
                expect($summaryValues.get(3).innerText).to.contain('Childs name')
                expect($summaryValues.get(4).innerText).to.contain('Arm')
                expect($summaryValues.get(5).innerText).to.contain('Right')
                expect($summaryValues.get(6).innerText).to.contain('Facing down')
                expect($summaryValues.get(7).innerText).to.contain('Face')
              })
          })
        })
      })

      context('Personal care needs section', () => {
        it('Should show correct headings, images, labels and values', () => {
          cy.get('[data-test="care-needs-summary"]').then($section => {
            cy.get($section)
              .find('h3')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 3)
                expect($headings.get(0).innerText).to.contain('Psychological Bi-Polar')
                expect($headings.get(1).innerText).to.contain('Reasonable adjustment Flexible refreshment breaks')
                expect($headings.get(2).innerText).to.contain('Reasonable adjustment Amplified telephone')
              })

            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 9)
                expect($summaryLabels.get(0).innerText).to.contain('Description')
                expect($summaryLabels.get(1).innerText).to.contain('From')
                expect($summaryLabels.get(2).innerText).to.contain('Status')
                expect($summaryLabels.get(3).innerText).to.contain('Establishment')
                expect($summaryLabels.get(4).innerText).to.contain('Date provided')
                expect($summaryLabels.get(5).innerText).to.contain('Comment')
                expect($summaryLabels.get(6).innerText).to.contain('Establishment')
                expect($summaryLabels.get(7).innerText).to.contain('Date provided')
                expect($summaryLabels.get(8).innerText).to.contain('Comment')
              })

            cy.get($section)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 9)
                expect($summaryValues.get(0).innerText).to.contain('Bi polar comment text')
                expect($summaryValues.get(1).innerText).to.contain('19 May 2020')
                expect($summaryValues.get(2).innerText).to.contain('Ongoing')
                expect($summaryValues.get(3).innerText).to.contain('MOORLAND (HMP & YOI)')
                expect($summaryValues.get(4).innerText).to.contain('01 May 2020')
                expect($summaryValues.get(5).innerText).to.contain('Flexible drinks comments')
                expect($summaryValues.get(6).innerText).to.contain('MOORLAND (HMP & YOI)')
                expect($summaryValues.get(7).innerText).to.contain('19 May 2020')
                expect($summaryValues.get(8).innerText).to.contain('Amped telephone comment')
              })
          })
        })
      })
      context('Languages section', () => {
        it('Should show correct languages content', () => {
          cy.get('[data-test="languages-summary"]').then($section => {
            cy.get($section)
              .find('[data-test="language-speaks-different"]')
              .should('contain.text', '\n        English  - interpreter required \n    ')

            cy.get($section)
              .find('[data-test="language-written-different"]')
              .should('contain.text', 'Russian (writes)')

            cy.get($section)
              .find('h3')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 1)
                expect($headings.get(0).innerText).to.contain('Other languages')
              })

            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 1)
                expect($summaryLabels.get(0).innerText).to.contain('English')
              })
          })
        })
      })

      context('Aliases section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="aliases-summary"]').then($section => {
            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 2)
                expect($summaryLabels.get(0).innerText).to.contain('Alias, First')
                expect($summaryLabels.get(1).innerText).to.contain('Alias, Second')
              })

            cy.get($section)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 2)
                expect($summaryValues.get(0).innerText).to.contain('31/08/1985')
                expect($summaryValues.get(1).innerText).to.contain('20/05/1986')
              })
          })
        })
      })

      context('Identifiers section', () => {
        it('Should show correct labels and values', () => {
          cy.get('[data-test="identifiers-summary"]').then($summary => {
            cy.get($summary)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 5)
                expect($summaryLabels.get(0).innerText).to.contain('PNC number')
                expect($summaryLabels.get(1).innerText).to.contain('CRO number')
                expect($summaryLabels.get(2).innerText).to.contain('National insurance number')
                expect($summaryLabels.get(3).innerText).to.contain('Home office reference number')
                expect($summaryLabels.get(4).innerText).to.contain('Driving licence number')
              })

            cy.get($summary)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 5)
                expect($summaryValues.get(0).innerText).to.contain('1234')
                expect($summaryValues.get(1).innerText).to.contain('2345')
                expect($summaryValues.get(2).innerText).to.contain('3456')
                expect($summaryValues.get(3).innerText).to.contain('4567')
                expect($summaryValues.get(4).innerText).to.contain('5678')
              })
          })
        })
      })

      context('Addresses section', () => {
        it('Should show correct headings, labels and values', () => {
          cy.get('[data-test="addresses-summary"]').then($section => {
            cy.get($section)
              .find('h3')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 1)
                expect($headings.get(0).innerText).to.contain('Primary address')
              })

            cy.get($section)
              .find('[data-test="address-type"]')
              .then($addressTypes => {
                cy.get($addressTypes)
                  .its('length')
                  .should('eq', 2)
                expect($addressTypes.get(0).innerText).to.contain('HDC Address')
                expect($addressTypes.get(1).innerText).to.contain('Approved Premises')
              })

            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 8)
                expect($summaryLabels.get(0).innerText).to.contain('Address')
                expect($summaryLabels.get(1).innerText).to.contain('Town')
                expect($summaryLabels.get(2).innerText).to.contain('County')
                expect($summaryLabels.get(3).innerText).to.contain('Postcode')
                expect($summaryLabels.get(4).innerText).to.contain('Country')
                expect($summaryLabels.get(5).innerText).to.contain('Phone')
                expect($summaryLabels.get(6).innerText).to.contain('Added')
                expect($summaryLabels.get(7).innerText).to.contain('Comments')
              })

            cy.get($section)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 8)
                expect($summaryValues.get(0).innerText).to.contain('Flat A, 13, High Street')
                expect($summaryValues.get(1).innerText).to.contain('Ulverston')
                expect($summaryValues.get(2).innerText).to.contain('West Yorkshire')
                expect($summaryValues.get(3).innerText).to.contain('LS1 AAA')
                expect($summaryValues.get(4).innerText).to.contain('England')
                expect($summaryValues.get(5).innerText).to.contain('011111111111')
                expect($summaryValues.get(6).innerText).to.contain('May 2020')
                expect($summaryValues.get(7).innerText).to.contain('address comment field')
              })
          })
        })
      })

      context('Active contacts section', () => {
        it('Should show correct headings, labels and values', () => {
          cy.get('[data-test="active-contacts-summary"]').then($section => {
            cy.get($section)
              .find('h3')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 2)
                expect($headings.get(0).innerText).to.contain('Personal')
                expect($headings.get(1).innerText).to.contain('John Smith')
              })

            cy.get($section)
              .find('p')
              .then($headings => {
                cy.get($headings)
                  .its('length')
                  .should('eq', 2)
                expect($headings.get(0).innerText).to.contain('Next of kin')
                expect($headings.get(1).innerText).to.contain('Emergency contact')
              })

            cy.get($section)
              .find('dt')
              .then($summaryLabels => {
                cy.get($summaryLabels)
                  .its('length')
                  .should('eq', 10)
                expect($summaryLabels.get(0).innerText).to.contain('Relationship')
                expect($summaryLabels.get(1).innerText).to.contain('Phone number')
                expect($summaryLabels.get(2).innerText).to.contain('Email')
                expect($summaryLabels.get(3).innerText).to.contain('Address')
                expect($summaryLabels.get(4).innerText).to.contain('Town')
                expect($summaryLabels.get(5).innerText).to.contain('County')
                expect($summaryLabels.get(6).innerText).to.contain('Postcode')
                expect($summaryLabels.get(7).innerText).to.contain('Country')
                expect($summaryLabels.get(8).innerText).to.contain('Address phone')
                expect($summaryLabels.get(9).innerText).to.contain('Address type')
              })

            cy.get($section)
              .find('dd')
              .then($summaryValues => {
                cy.get($summaryValues)
                  .its('length')
                  .should('eq', 10)
                expect($summaryValues.get(0).innerText).to.contain('Cousin')
                expect($summaryValues.get(1).innerText).to.contain('02222222222, 033333333333')
                expect($summaryValues.get(2).innerText).to.contain('test1@email.com, test2@email.com')
                expect($summaryValues.get(3).innerText).to.contain('Flat A, 13, High Street')
                expect($summaryValues.get(4).innerText).to.contain('Ulverston')
                expect($summaryValues.get(5).innerText).to.contain('West Yorkshire')
                expect($summaryValues.get(6).innerText).to.contain('LS1 AAA')
                expect($summaryValues.get(7).innerText).to.contain('England')
                expect($summaryValues.get(8).innerText).to.contain('011111111111')
                expect($summaryValues.get(9).innerText).to.contain('Home')
              })
          })
        })
      })
    })

    context('When there is no fixed abode for a prisoner', () => {
      before(() => {
        cy.task('stubPrisonerProfileHeaderData', headerDetails)
        cy.task('stubPersonal', { addresses: [{ ...primaryAddress, noFixedAddress: true }] })
        visitPersonalAndExpandAccordions()
      })

      it('Should show the correct content in the address section', () => {
        cy.get('[data-test="addresses-summary"]').then($section => {
          cy.get($section)
            .find('h3')
            .then($headings => {
              cy.get($headings)
                .its('length')
                .should('eq', 1)
              expect($headings.get(0).innerText).to.contain('Primary address')
            })

          cy.get($section)
            .find('[data-test="no-fixed-abode"]')
            .should('have.text', 'No fixed abode')
        })
      })
    })
  })
})
