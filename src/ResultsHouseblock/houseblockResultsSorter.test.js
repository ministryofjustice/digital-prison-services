import sortHouseblockData from './houseblockResultsSorter'
import { ASC, DESC } from '../tablesorting/sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from '../tablesorting/sortColumns'

describe('Houseblock data sorter tests', () => {
  it('sorts an empty array', () => {
    sortHouseblockData([], 'lastName', 'ASC')
  })

  describe('sort by last name', () => {
    describe('activity', () => {
      const data = [
        { activities: [{ lastName: 'B' }] },
        { activities: [{ lastName: 'A' }] },
        { activities: [{ lastName: 'C' }] },
      ]

      it('ascending', () => {
        sortHouseblockData(data, LAST_NAME, ASC)
        expect(data).toEqual([
          { activities: [{ lastName: 'A' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'C' }] },
        ])
      })

      it('descending', () => {
        sortHouseblockData(data, LAST_NAME, DESC)
        expect(data).toEqual([
          { activities: [{ lastName: 'C' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'A' }] },
        ])
      })
    })

    describe('activities[0]', () => {
      const data = [
        { activities: [{ lastName: 'B' }] },
        { activities: [{ lastName: 'A' }] },
        { activities: [{ lastName: 'C' }] },
      ]

      it('ascending', () => {
        sortHouseblockData(data, LAST_NAME, ASC)
        expect(data).toEqual([
          { activities: [{ lastName: 'A' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'C' }] },
        ])
      })

      it('descending', () => {
        sortHouseblockData(data, LAST_NAME, DESC)
        expect(data).toEqual([
          { activities: [{ lastName: 'C' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'A' }] },
        ])
      })
    })

    describe('mixed', () => {
      const data = [
        { activities: [{ lastName: 'B' }] },
        { activities: [{ lastName: 'A' }] },
        { activities: [{ lastName: 'C' }] },
      ]

      it('ascending', () => {
        sortHouseblockData(data, LAST_NAME, ASC)
        expect(data).toEqual([
          { activities: [{ lastName: 'A' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'C' }] },
        ])
      })

      it('descending', () => {
        sortHouseblockData(data, LAST_NAME, DESC)
        expect(data).toEqual([
          { activities: [{ lastName: 'C' }] },
          { activities: [{ lastName: 'B' }] },
          { activities: [{ lastName: 'A' }] },
        ])
      })
    })
  })

  describe('sort by last name, then firstName', () => {
    describe('activity', () => {
      const data = [
        { activities: [{ lastName: 'B', firstName: 'P' }] },
        { activities: [{ lastName: 'A', firstName: 'Q' }] },
        { activities: [{ lastName: 'A', firstName: 'P' }] },
        { activities: [{ lastName: 'B', firstName: 'Q' }] },
      ]

      it('ascending', () => {
        sortHouseblockData(data, LAST_NAME, ASC)
        expect(data).toEqual([
          { activities: [{ lastName: 'A', firstName: 'P' }] },
          { activities: [{ lastName: 'A', firstName: 'Q' }] },
          { activities: [{ lastName: 'B', firstName: 'P' }] },
          { activities: [{ lastName: 'B', firstName: 'Q' }] },
        ])
      })

      it('descending', () => {
        sortHouseblockData(data, LAST_NAME, DESC)
        expect(data).toEqual([
          { activities: [{ lastName: 'B', firstName: 'Q' }] },
          { activities: [{ lastName: 'B', firstName: 'P' }] },
          { activities: [{ lastName: 'A', firstName: 'Q' }] },
          { activities: [{ lastName: 'A', firstName: 'P' }] },
        ])
      })
    })
  })

  describe('Sort by cellLocation', () => {
    const data = [
      { activities: [{ cellLocation: 'MDI-1-2-007' }] },
      { activities: [{ cellLocation: 'MDI-1-2-006' }] },
      { activities: [{ cellLocation: 'MDI-1-1-007' }] },
    ]

    it('ascending', () => {
      sortHouseblockData(data, CELL_LOCATION, ASC)
      expect(data).toEqual([
        { activities: [{ cellLocation: 'MDI-1-1-007' }] },
        { activities: [{ cellLocation: 'MDI-1-2-006' }] },
        { activities: [{ cellLocation: 'MDI-1-2-007' }] },
      ])
    })
  })

  describe('Sort by activity (eventDescription), then lastName, then firstName', () => {
    const data = [
      { activities: [{ event: 'PA', comment: 'B', mainActivity: true }] },
      { activities: [{ eventType: 'PRISON_ACT', comment: 'A', mainActivity: true }] },
      { activities: [{ comment: 'D', eventDescription: 'F', mainActivity: true }] },
      { activities: [{ comment: 'D', eventDescription: 'E', mainActivity: true }] },
      { activities: [{ eventDescription: 'C', mainActivity: true }] },
      { activities: [{ eventDescription: 'C', lastName: 'B', firstName: 'P', mainActivity: true }] },
      { activities: [{ eventDescription: 'C', lastName: 'A', firstName: 'Q', mainActivity: true }] },
      { activities: [{ eventDescription: 'C', lastName: 'A', firstName: 'P', mainActivity: true }] },
      { activities: [{ eventDescription: 'C', lastName: 'B', firstName: 'Q', mainActivity: true }] },
    ]
    it('sorts ascending', () => {
      sortHouseblockData(data, ACTIVITY, ASC)
      expect(data).toEqual([
        { activities: [{ eventType: 'PRISON_ACT', comment: 'A', mainActivity: true }] },
        { activities: [{ event: 'PA', comment: 'B', mainActivity: true }] },
        { activities: [{ eventDescription: 'C', mainActivity: true }] },
        { activities: [{ eventDescription: 'C', lastName: 'A', firstName: 'P', mainActivity: true }] },
        { activities: [{ eventDescription: 'C', lastName: 'A', firstName: 'Q', mainActivity: true }] },
        { activities: [{ eventDescription: 'C', lastName: 'B', firstName: 'P', mainActivity: true }] },
        { activities: [{ eventDescription: 'C', lastName: 'B', firstName: 'Q', mainActivity: true }] },
        { activities: [{ comment: 'D', eventDescription: 'E', mainActivity: true }] },
        { activities: [{ comment: 'D', eventDescription: 'F', mainActivity: true }] },
      ])
    })
  })
})
