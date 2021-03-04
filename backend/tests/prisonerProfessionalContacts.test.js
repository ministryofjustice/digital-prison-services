const prisonerProfessionalContacts = require('../controllers/prisonerProfile/prisonerProfessionalContacts')

describe('Prisoner professional contacts', () => {
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}
  const allocationManagerApi = {}
  const personService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    personService.getPersonContactDetails = jest.fn().mockResolvedValue({})

    prisonApi.getDetails = jest.fn().mockResolvedValue({ bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getPrisonerContacts = jest.fn().mockResolvedValue([])

    allocationManagerApi.getPomByOffenderNo = jest.fn().mockResolvedValue({})

    controller = prisonerProfessionalContacts({ prisonApi, personService, allocationManagerApi, logError })
  })

  it('should get the prisoner details', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
  })

  it('should get the contacts by bookingId and Poms by offenderNo', async () => {
    await controller(req, res)

    expect(prisonApi.getPrisonerContacts).toHaveBeenCalledWith(res.locals, bookingId)
    expect(allocationManagerApi.getPomByOffenderNo).toHaveBeenCalledWith(res.locals, offenderNo)
  })

  describe('when there is no data', () => {
    it('should still render the template', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerProfessionalContacts/prisonerProfessionalContacts.njk',
        {
          breadcrumbPrisonerName: 'Smith, John',
          contactsGroupedByRelationship: [],
          offenderNo: 'ABC123',
          prisonerName: 'John Smith',
        }
      )
    })
  })

  describe('when there is data', () => {
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

    beforeEach(() => {
      prisonApi.getPrisonerContacts.mockResolvedValue({
        nextOfKin: [],
        otherContacts: [
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
            bookingId,
          },
          {
            lastName: 'SMITH',
            firstName: 'INACTIVE',
            contactType: 'O',
            contactTypeDescription: 'Official',
            relationship: 'PROB',
            relationshipDescription: 'Probation Officer',
            emergencyContact: false,
            nextOfKin: false,
            relationshipId: 6865391,
            personId: 444,
            activeFlag: false,
            approvedVisitorFlag: false,
            canBeContactedFlag: false,
            awareOfChargesFlag: false,
            contactRootOffenderId: 0,
            bookingId,
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
            relationshipId: 7550160,
            personId: 333,
            activeFlag: true,
            approvedVisitorFlag: false,
            canBeContactedFlag: false,
            awareOfChargesFlag: false,
            contactRootOffenderId: 0,
            bookingId,
            createDateTime: '2019-01-01T12:00:00',
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
            bookingId,
            createDateTime: '2020-01-01T12:00:00',
          },
        ],
      })
    })

    describe('when all possible data is available', () => {
      beforeEach(() => {
        personService.getPersonContactDetails.mockResolvedValue({
          addresses: [businessNonPrimary, businessPrimary],
          emails: [{ email: 'test3@email.com' }, { email: 'test4@email.com' }],
          phones: [{ number: '04444444444', type: 'MOB' }, { number: '055555555555', type: 'BUS', ext: '123' }],
        })

        allocationManagerApi.getPomByOffenderNo.mockResolvedValue({
          primary_pom: { staffId: 1, name: 'SMITH, JANE' },
          secondary_pom: { staffId: 2, name: 'DOE, JOHN' },
        })
      })

      it('should make calls for contact details of all active rofessional contacts', async () => {
        await controller(req, res)

        expect(personService.getPersonContactDetails.mock.calls.length).toBe(3)
        expect(personService.getPersonContactDetails).toHaveBeenCalledWith(res.locals, 111)
        expect(personService.getPersonContactDetails).toHaveBeenCalledWith(res.locals, 222)
        expect(personService.getPersonContactDetails).toHaveBeenCalledWith(res.locals, 333)
        expect(personService.getPersonContactDetails).not.toHaveBeenCalledWith(res.locals, 444)
      })

      it('should render the template with the correctly formatted data in the correct alphabetical orders', async () => {
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerProfessionalContacts/prisonerProfessionalContacts.njk',
          {
            breadcrumbPrisonerName: 'Smith, John',
            contactsGroupedByRelationship: [
              {
                relationship: 'Case Administrator',
                contacts: [
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '999<br>Flat 222, Business street<br>Test locality<br>London<br>London',
                        label: 'Main address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W1 ABC',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],
                    name: 'Trevor Smith',
                    noFixedAddress: false,
                  },
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '000<br>Flat 222, Business street<br>New locality<br>Manchester<br>Greater Manchester',
                        label: 'Other address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W2 DEF',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],
                    name: 'Trevor Smith',
                    noFixedAddress: false,
                  },
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '999<br>Flat 222, Business street<br>Test locality<br>London<br>London',
                        label: 'Main address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W1 ABC',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],
                    name: 'Uriualche Lydyle',
                    noFixedAddress: false,
                  },
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '000<br>Flat 222, Business street<br>New locality<br>Manchester<br>Greater Manchester',
                        label: 'Other address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W2 DEF',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],
                    name: 'Uriualche Lydyle',
                    noFixedAddress: false,
                  },
                ],
              },
              {
                relationship: 'Prison Offender Manager',
                contacts: [
                  {
                    jobTitle: false,
                    name: 'Jane Smith',
                  },
                  {
                    jobTitle: 'Co-worker',
                    name: 'John Doe',
                  },
                ],
              },
              {
                relationship: 'Probation Officer',
                contacts: [
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '999<br>Flat 222, Business street<br>Test locality<br>London<br>London',
                        label: 'Main address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W1 ABC',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],

                    name: 'Areneng Kimbur',
                    noFixedAddress: false,
                  },
                  {
                    details: [
                      {
                        html: '04444444444,<br>055555555555 extension number 123',
                        label: 'Phone number',
                      },
                      {
                        label: 'Email',
                        value: 'test3@email.com, test4@email.com',
                      },
                      {
                        html: '000<br>Flat 222, Business street<br>New locality<br>Manchester<br>Greater Manchester',
                        label: 'Other address',
                      },
                      {
                        label: 'Postcode',
                        value: 'W2 DEF',
                      },
                      {
                        label: 'Country',
                        value: 'England',
                      },
                      {
                        html: '',
                        label: 'Address phone',
                      },
                      {
                        label: 'Address type',
                        value: 'Business',
                      },
                    ],

                    name: 'Areneng Kimbur',
                    noFixedAddress: false,
                  },
                ],
              },
            ],
            offenderNo: 'ABC123',
            prisonerName: 'John Smith',
          }
        )
      })
    })
  })

  describe('errors', () => {
    it('should render the error template with a link to the homepage if there is a problem retrieving prisoner details', async () => {
      const error = new Error('Network error')
      prisonApi.getDetails.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
    })
  })
})
