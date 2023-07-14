import moment from 'moment'
import { getNonAssociationsInEstablishment } from '../../controllers/cellMove/cellMoveUtils'

describe('Cell move utils', () => {
  const nonAssociations = {
    offenderNo: 'ABC123',
    firstName: 'Fred',
    lastName: 'Bloggs',
    agencyDescription: 'Moorland (HMP & YOI)',
    assignedLivingUnitDescription: 'MDI-1-1-3',
    assignedLivingUnitId: 180353,
    nonAssociations: [
      {
        reasonCode: 'VIC',
        reasonDescription: 'Victim',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: moment().add(7, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        expiryDate: null,
        authorisedBy: 'string',
        comments: 'Not effective yet',
        offenderNonAssociation: {
          offenderNo: 'ABC124',
          firstName: 'Andy',
          lastName: 'Adams',
          reasonCode: 'PER',
          reasonDescription: 'Perpetrator',
          agencyDescription: 'Moorland (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
      {
        reasonCode: 'VIC',
        reasonDescription: 'Victim',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
        expiryDate: null,
        authorisedBy: 'string',
        comments: 'Effective from today',
        offenderNonAssociation: {
          offenderNo: 'ABC125',
          firstName: 'Brian',
          lastName: 'Blessed',
          reasonCode: 'PER',
          reasonDescription: 'Perpetrator',
          agencyDescription: 'Moorland (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
      {
        reasonCode: 'RIV',
        reasonDescription: 'Rival gang',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: moment().subtract(1, 'years').format('YYYY-MM-DDTHH:mm:ss'),
        expiryDate: moment().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss'),
        authorisedBy: 'string',
        comments: 'Effective until tomorrow',
        offenderNonAssociation: {
          offenderNo: 'ABC126',
          firstName: 'Clarence',
          lastName: 'Cook',
          reasonCode: 'RIV',
          reasonDescription: 'Rival gang',
          agencyDescription: 'Moorland (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
      {
        reasonCode: 'VIC',
        reasonDescription: 'Victim',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: '2018-12-01T13:34:00',
        expiryDate: '2019-12-01T13:34:00',
        authorisedBy: 'string',
        comments: 'This one has expired',
        offenderNonAssociation: {
          offenderNo: 'ABC127',
          firstName: 'Dave',
          lastName: 'Digby',
          reasonCode: 'PER',
          reasonDescription: 'Perpetrator',
          agencyDescription: 'Moorland (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
      {
        reasonCode: 'VIC',
        reasonDescription: 'Victim',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: '2018-12-01T13:34:00',
        expiryDate: null,
        authorisedBy: 'string',
        comments: 'From an old booking',
        offenderNonAssociation: {
          offenderNo: 'ABC128',
          firstName: 'Emily',
          lastName: 'Egerton',
          reasonCode: 'PER',
          reasonDescription: 'Perpetrator',
          agencyDescription: 'OUTSIDE',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
      {
        reasonCode: 'VIC',
        reasonDescription: 'Victim',
        typeCode: 'WING',
        typeDescription: 'Do Not Locate on Same Wing',
        effectiveDate: '2018-12-01T13:34:00',
        expiryDate: null,
        authorisedBy: 'string',
        comments: 'From an old booking',
        offenderNonAssociation: {
          offenderNo: 'ABC129',
          firstName: 'Frank',
          lastName: 'Fibonacci',
          reasonCode: 'PER',
          reasonDescription: 'Perpetrator',
          agencyDescription: 'Moorland (HMP & YOI)',
          assignedLivingUnitDescription: 'MDI-2-1-3',
          assignedLivingUnitId: 123,
        },
      },
    ],
  }

  const prisonApi = {
    getDetails: jest.fn((_, offenderNo) => {
      return {
        agencyId: offenderNo === 'ABC129' ? 'BXI' : 'MDI',
        offenderNo,
      }
    }),
  }

  describe('getNonAssociationsInEstablishment', () => {
    let result

    beforeAll(async () => {
      result = await getNonAssociationsInEstablishment(nonAssociations, {}, prisonApi)
    })

    it('returns valid non-associations', async () => {
      expect(result).toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Brian',
            lastName: 'Blessed',
          }),
        })
      )
      expect(result).toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Clarence',
            lastName: 'Cook',
          }),
        })
      )
    })

    it('filters out expired non-associations', async () => {
      expect(result).not.toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Dave',
            lastName: 'Digby',
          }),
        })
      )
    })

    it('filters out not yet effective non-associations', async () => {
      expect(result).not.toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Andy',
            lastName: 'Adams',
          }),
        })
      )
    })

    it('includes non-associations from old bookings', async () => {
      expect(result).toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Emily',
            lastName: 'Egerton',
          }),
        })
      )
    })

    it('filters out non-associations with a different current location', async () => {
      expect(result).not.toContainEqual(
        expect.objectContaining({
          offenderNonAssociation: expect.objectContaining({
            firstName: 'Frank',
            lastName: 'Fibonacci',
          }),
        })
      )
    })
  })
})
