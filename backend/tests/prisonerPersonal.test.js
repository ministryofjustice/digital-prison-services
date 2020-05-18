const prisonerPersonal = require('../controllers/prisonerProfile/prisonerPersonal')

describe('prisoner personal', () => {
  const offenderNo = 'ABC123'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
  }
  const bookingId = '123'
  const elite2Api = {}
  const prisonerProfileService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo } }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockResolvedValue({})
    elite2Api.getPrisonerDetail = jest.fn().mockResolvedValue({})
    elite2Api.getIdentifiers = jest.fn().mockResolvedValue([])
    elite2Api.getOffenderAliases = jest.fn().mockResolvedValue([])
    elite2Api.getPrisonerProperty = jest.fn().mockResolvedValue([])
    controller = prisonerPersonal({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the basic details of a prisoner and the prisoner header details and render them', async () => {
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
      expect.objectContaining({
        prisonerProfileData,
      })
    )
  })

  describe('identifiers', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for identifiers data', async () => {
      await controller(req, res)

      expect(elite2Api.getIdentifiers).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing identifier data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [{ label: 'PNC number', value: undefined }],
          })
        )
      })
    })

    describe('when there is identifier data', () => {
      beforeEach(() => {
        elite2Api.getIdentifiers = jest
          .fn()
          .mockResolvedValue([
            { type: 'PNC', value: '1234' },
            { type: 'CRO', value: '2345' },
            { type: 'NINO', value: '3456' },
            { type: 'HOREF', value: '4567' },
            { type: 'DL', value: '5678' },
          ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            identifiers: [
              { label: 'PNC number', value: '1234' },
              { label: 'CRO number', value: '2345' },
              { label: 'National insurance number', value: '3456' },
              { label: 'Home office reference number', value: '4567' },
              { label: 'Driving licence number', value: '5678' },
            ],
          })
        )
      })
    })
  })

  describe('aliases', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    it('should make a call for identifiers data', async () => {
      await controller(req, res)

      expect(elite2Api.getOffenderAliases).toHaveBeenCalledWith(res.locals, bookingId)
    })

    describe('when there is missing aliases data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [],
          })
        )
      })
    })

    describe('when there is aliases data', () => {
      beforeEach(() => {
        elite2Api.getOffenderAliases = jest
          .fn()
          .mockResolvedValue([
            { firstName: 'First', lastName: 'Alias', dob: '1985-08-31' },
            { firstName: 'Second', lastName: 'Alias', dob: '1986-05-20' },
          ])
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            aliases: [{ label: 'Alias, First', value: '31/08/1985' }, { label: 'Alias, Second', value: '20/05/1986' }],
          })
        )
      })
    })
  })

  describe('physical characteristics', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing physical characteristic data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: undefined },
              { label: 'Weight', value: undefined },
              { label: 'Hair colour', value: undefined },
              { label: 'Left eye colour', value: undefined },
              { label: 'Right eye colour', value: undefined },
              { label: 'Facial hair', value: undefined },
              { label: 'Shape of face', value: undefined },
              { label: 'Build', value: undefined },
              { label: 'Shoe size', value: undefined },
            ],
          })
        )
      })
    })

    describe('when there is physical characteristic data', () => {
      beforeEach(() => {
        elite2Api.getPrisonerDetail.mockResolvedValue({
          physicalAttributes: {
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
        })
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            physicalCharacteristics: [
              { label: 'Height', value: '1.91m' },
              { label: 'Weight', value: '86kg' },
              { label: 'Hair colour', value: 'Brown' },
              { label: 'Left eye colour', value: 'Blue' },
              { label: 'Right eye colour', value: 'Green' },
              { label: 'Facial hair', value: 'Moustache' },
              { label: 'Shape of face', value: 'Round' },
              { label: 'Build', value: 'Athletic' },
              { label: 'Shoe size', value: '12' },
            ],
          })
        )
      })
    })
  })

  describe('distinguishing physical marks', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('when there is missing distinguishing physical marks data', () => {
      it('should still render the personal template', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: undefined,
          })
        )
      })
    })

    describe('when there is distinguishing physical marks data', () => {
      beforeEach(() => {
        elite2Api.getPrisonerDetail.mockResolvedValue({
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
        })
      })

      it('should render the personal template with the correctly formatted data', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
          expect.objectContaining({
            distinguishingMarks: [
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Left' },
                  { label: 'Orientation', value: 'Facing up' },
                  { label: 'Comment', value: 'Childs name' },
                ],
                label: 'Tattoo',
              },
              {
                details: [
                  { label: 'Body part', value: 'Arm' },
                  { label: 'Side', value: 'Right' },
                  { label: 'Orientation', value: 'Facing down' },
                  { label: 'Comment', value: 'Face' },
                ],
                label: 'Tattoo',
                imageId: 123,
              },
            ],
          })
        )
      })
    })
  })

  describe('personal details section', () => {
    beforeEach(() => {
      elite2Api.getDetails.mockResolvedValue({ bookingId })
    })

    describe('primary', () => {
      describe('when there is missing primary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                primary: [
                  { label: 'Age', value: undefined },
                  { label: 'Date of Birth', value: undefined },
                  { label: 'Place of Birth', value: undefined },
                  { label: 'Gender', value: undefined },
                  { label: 'Ethnicity', value: undefined },
                  { label: 'Religion', value: undefined },
                  { label: 'Nationality', value: undefined },
                ],
              }),
            })
          )
        })
      })

      describe('when there is primary data', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            dateOfBirth: '1990-10-12',
            age: 29,
            birthPlace: 'DONCASTER',
            physicalAttributes: {
              gender: 'Male',
              ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
            },
            profileInformation: [
              { type: 'RELF', resultValue: 'Christian' },
              { type: 'NAT', resultValue: 'British' },
              { type: 'NAT', resultValue: 'British' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                primary: [
                  { label: 'Age', value: 29 },
                  { label: 'Date of Birth', value: '12/10/1990' },
                  { label: 'Place of Birth', value: 'Doncaster' },
                  { label: 'Gender', value: 'Male' },
                  { label: 'Ethnicity', value: 'White: Eng./Welsh/Scot./N.Irish/British' },
                  { label: 'Religion', value: 'Christian' },
                  { label: 'Nationality', value: 'British' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('secondary', () => {
      describe('when there is missing secondary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                secondary: [
                  { label: 'Sexual orientation', value: undefined },
                  { label: 'Marital status', value: undefined },
                  { label: 'Number of children', value: undefined },
                  { label: 'Smoker or vaper', value: undefined },
                ],
              }),
            })
          )
        })
      })

      describe('when there is secondary data', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            profileInformation: [
              { type: 'SEXO', resultValue: 'Hetrosexual' },
              { type: 'MARITAL', resultValue: 'Single-not married/in civil partnership' },
              { type: 'CHILD', resultValue: 2 },
              { type: 'SMOKE', resultValue: 'Yes' },
              { type: 'DIET', resultValue: 'Religion - Muslim' },
            ],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                secondary: [
                  { label: 'Sexual orientation', value: 'Hetrosexual' },
                  { label: 'Marital status', value: 'Single-not married/in civil partnership' },
                  { label: 'Number of children', value: 2 },
                  { label: 'Smoker or vaper', value: 'Yes' },
                  { label: 'Type of diet', value: 'Religion - Muslim' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('tertiary', () => {
      describe('when there is missing tertiary data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                tertiary: [{ label: 'Interest to immigration', value: undefined }],
              }),
            })
          )
        })
      })

      describe('when there is tertiary data', () => {
        describe('when travel restrictions does not have a value and other values are No', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [
                { type: 'IMM', resultValue: 'No' },
                { type: 'TRAVEL', resultValue: '' },
                { type: 'PERSC', resultValue: 'No' },
                { type: 'YOUTH', resultValue: 'No' },
                { type: 'DNA', resultValue: 'No' },
              ],
            })
          })

          it('should not display the other tertiary data items', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  tertiary: [{ label: 'Interest to immigration', value: 'No' }],
                }),
              })
            )
          })
        })

        describe('when travel restrictions does have a value and other values are Yes', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [
                { type: 'IMM', resultValue: 'Yes' },
                { type: 'TRAVEL', resultValue: 'Cannot travel to Sheffield' },
                { type: 'PERSC', resultValue: 'Yes' },
                { type: 'YOUTH', resultValue: 'Yes' },
                { type: 'DNA', resultValue: 'Yes' },
              ],
            })
          })

          it('should display the other tertiary data items', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  tertiary: [
                    { label: 'Interest to immigration', value: 'Yes' },
                    { label: 'Travel restrictions', value: 'Cannot travel to Sheffield' },
                    { label: 'Social care needed', value: 'Yes' },
                    { label: 'Youth offender', value: 'Yes' },
                    { label: 'DNA required', value: 'Yes' },
                  ],
                }),
              })
            )
          })
        })
      })
    })

    describe('reception warnings', () => {
      describe('when there is missing reception warnings data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Needs to be warned' },
                  { label: 'Warned not to change appearance', value: 'Needs to be warned' },
                ],
              }),
            })
          )
        })
      })

      describe('when the prisoner has been warned about tattooing and their appearance', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            profileInformation: [{ type: 'TAT', resultValue: 'Yes' }, { type: 'APPEAR', resultValue: 'Yes' }],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Yes' },
                  { label: 'Warned not to change appearance', value: 'Yes' },
                ],
              }),
            })
          )
        })
      })

      describe('when the prisoner has not been warned about tattooing and their appearance', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            profileInformation: [{ type: 'TAT', resultValue: 'No' }, { type: 'APPEAR', resultValue: 'No' }],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                receptionWarnings: [
                  { label: 'Warned about tattooing', value: 'Needs to be warned' },
                  { label: 'Warned not to change appearance', value: 'Needs to be warned' },
                ],
              }),
            })
          )
        })
      })
    })

    describe('listener', () => {
      describe('when there is missing listener data', () => {
        it('should display nothing', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                listener: [],
              }),
            })
          )
        })
      })

      describe('listener suitable and recognised', () => {
        describe('when suitable is No and recognised is No', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'No' }, { type: 'LIST_REC', resultValue: 'No' }],
            })
          })

          it('should display nothing', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is No', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'Yes' }, { type: 'LIST_REC', resultValue: 'No' }],
            })
          })

          it('should display both suitable and recognised', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [
                    { label: 'Listener suitable', value: 'Yes' },
                    { label: 'Listener - recognised', value: 'No' },
                  ],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is Yes', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'Yes' }, { type: 'LIST_REC', resultValue: 'Yes' }],
            })
          })

          it('should display recognised only', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [{ label: 'Listener - recognised', value: 'Yes' }],
                }),
              })
            )
          })
        })

        describe('when suitable is Yes and recognised is empty', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'Yes' }],
            })
          })

          it('should display suitable with value and recognised with no value', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [
                    { label: 'Listener suitable', value: 'Yes' },
                    { label: 'Listener - recognised', value: undefined },
                  ],
                }),
              })
            )
          })
        })

        describe('when suitable is No and recognised is Yes', () => {
          beforeEach(() => {
            elite2Api.getPrisonerDetail.mockResolvedValue({
              profileInformation: [{ type: 'LIST_SUIT', resultValue: 'No' }, { type: 'LIST_REC', resultValue: 'Yes' }],
            })
          })

          it('should display nothing', async () => {
            await controller(req, res)

            expect(res.render).toHaveBeenCalledWith(
              'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
              expect.objectContaining({
                personalDetails: expect.objectContaining({
                  listener: [],
                }),
              })
            )
          })
        })
      })
    })

    describe('domestic abuse', () => {
      describe('when there is missing domestic abuse data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [],
              }),
            })
          )
        })
      })

      describe('when there is domestic abuse data', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            profileInformation: [{ type: 'DOMESTIC', resultValue: 'Yes' }, { type: 'DOMVIC', resultValue: 'Yes' }],
          })
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [
                  { label: 'Domestic abuse perpetrator', value: 'Yes' },
                  { label: 'Domestic abuse victim', value: 'Yes' },
                ],
              }),
            })
          )
        })
      })

      describe('when the domestic abuse values are NO', () => {
        beforeEach(() => {
          elite2Api.getPrisonerDetail.mockResolvedValue({
            profileInformation: [{ type: 'DOMESTIC', resultValue: 'NO' }, { type: 'DOMVIC', resultValue: 'NO' }],
          })
        })

        it('should not render any domestic abuse related items', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                domesticAbuse: [],
              }),
            })
          )
        })
      })
    })

    describe('property', () => {
      describe('when there is missing property data', () => {
        it('should still render the personal template', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                property: [],
              }),
            })
          )
        })
      })

      describe('when there is property data', () => {
        beforeEach(() => {
          elite2Api.getPrisonerProperty.mockResolvedValue([
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
          ])
        })

        it('should render the personal template with the correctly formatted data', async () => {
          await controller(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
            expect.objectContaining({
              personalDetails: expect.objectContaining({
                property: [
                  {
                    details: [{ label: 'Seal mark', value: 123 }, { label: 'Location', value: 'Property Box 123' }],
                    label: 'Property',
                    value: 'Valuables',
                  },
                  {
                    details: [{ label: 'Seal mark', value: 456 }, { label: 'Location', value: 'Property Box 456' }],
                    label: 'Property',
                    value: 'Bulk',
                  },
                ],
              }),
            })
          )
        })
      })
    })
  })

  describe.skip('when there are errors with retrieving information', () => {
    beforeEach(() => {
      req.params.offenderNo = offenderNo
      elite2Api.getIdentifiers.mockRejectedValue(new Error('Network error'))
      elite2Api.getOffenderAliases.mockRejectedValue(new Error('Network error'))
      elite2Api.getPrisonerProperty.mockRejectedValue(new Error('Network error'))
    })

    it('should still render the personal template with missing data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerPersonal/prisonerPersonal.njk',
        expect.objectContaining({
          aliases: null,
          distinguishingMarks: null,
          identifiers: [{ label: 'PNC number', value: null }],
          personalDetails: expect.objectContaining({
            property: null,
          }),
        })
      )
    })
  })
})
