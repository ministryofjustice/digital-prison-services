const personService = require('../services/personService')

describe('person service', () => {
  const context = {}
  const elite2Api = {}
  let service

  beforeEach(() => {
    elite2Api.getPersonAddresses = jest.fn()
    elite2Api.getPersonEmails = jest.fn()
    elite2Api.getPersonPhones = jest.fn()
    service = personService(elite2Api)
  })

  describe('person contact details', () => {
    const personId = '1234'
    const addresses = [
      {
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
        phones: [{ number: '07711333444', type: 'MOB' }, { number: '011333444', type: 'BUS', ext: '777' }],
      },
    ]
    const emails = [{ email: 'email@addressgoeshere.com' }]
    const phones = [{ number: '07711333444', type: 'MOB' }, { number: '011333444', type: 'BUS', ext: '777' }]

    beforeEach(() => {
      elite2Api.getPersonAddresses.mockResolvedValue(addresses)
      elite2Api.getPersonEmails.mockResolvedValue(emails)
      elite2Api.getPersonPhones.mockResolvedValue(phones)
    })

    it('should make a call for the contact details of the specified person', async () => {
      await service.getPersonContactDetails(context, personId)

      expect(elite2Api.getPersonAddresses).toHaveBeenCalledWith(context, personId)
      expect(elite2Api.getPersonEmails).toHaveBeenCalledWith(context, personId)
      expect(elite2Api.getPersonPhones).toHaveBeenCalledWith(context, personId)
    })

    it('should return the correct contact details', async () => {
      const getPersonContactDetails = await service.getPersonContactDetails(context, personId)

      expect(getPersonContactDetails).toEqual({ addresses, emails, phones })
    })

    describe('when there are errors with retrieving information', () => {
      beforeEach(() => {
        elite2Api.getPersonAddresses.mockRejectedValue(new Error('Network error'))
        elite2Api.getPersonEmails.mockRejectedValue(new Error('Network error'))
        elite2Api.getPersonPhones.mockRejectedValue(new Error('Network error'))
      })

      it('should still pass those values as null', async () => {
        const getPersonContactDetails = await service.getPersonContactDetails(context, personId)

        expect(getPersonContactDetails).toEqual(
          expect.objectContaining({
            addresses: null,
            emails: null,
            phones: null,
          })
        )
      })
    })
  })
})
