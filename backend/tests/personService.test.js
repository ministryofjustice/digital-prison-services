const personService = require('../services/personService')

describe('person service', () => {
  const context = {}
  const prisonApi = {}
  let service

  beforeEach(() => {
    prisonApi.getPersonAddresses = jest.fn()
    prisonApi.getPersonEmails = jest.fn()
    prisonApi.getPersonPhones = jest.fn()
    service = personService(prisonApi)
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
        phones: [
          { number: '07711333444', type: 'MOB' },
          { number: '011333444', type: 'BUS', ext: '777' },
        ],
      },
    ]
    const emails = [{ email: 'email@addressgoeshere.com' }]
    const phones = [
      { number: '07711333444', type: 'MOB' },
      { number: '011333444', type: 'BUS', ext: '777' },
    ]

    beforeEach(() => {
      prisonApi.getPersonAddresses.mockResolvedValue(addresses)
      prisonApi.getPersonEmails.mockResolvedValue(emails)
      prisonApi.getPersonPhones.mockResolvedValue(phones)
    })

    it('should make a call for the contact details of the specified person', async () => {
      await service.getPersonContactDetails(context, personId)

      expect(prisonApi.getPersonAddresses).toHaveBeenCalledWith(context, personId)
      expect(prisonApi.getPersonEmails).toHaveBeenCalledWith(context, personId)
      expect(prisonApi.getPersonPhones).toHaveBeenCalledWith(context, personId)
    })

    it('should return the correct contact details', async () => {
      const getPersonContactDetails = await service.getPersonContactDetails(context, personId)

      expect(getPersonContactDetails).toEqual({ addresses, emails, phones })
    })

    describe('when there are errors with retrieving information', () => {
      beforeEach(() => {
        prisonApi.getPersonAddresses.mockRejectedValue(new Error('Network error'))
        prisonApi.getPersonEmails.mockRejectedValue(new Error('Network error'))
        prisonApi.getPersonPhones.mockRejectedValue(new Error('Network error'))
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
