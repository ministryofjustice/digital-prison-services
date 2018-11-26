import sortHouseBlockData from './houseBlockResultsSorter'

describe('Houseblock data sorter tests', () => {
  it('sorts an empty array', () => {
    sortHouseBlockData([], 'lastName', 'ASC')
  })

  describe('sort by last name', () => {
    describe('activity', () => {
      const data = [{ activity: { lastName: 'B' } }, { activity: { lastName: 'A' } }, { activity: { lastName: 'C' } }]

      it('ascending', () => {
        sortHouseBlockData(data, 'lastName', 'ASC')
        expect(data).toEqual([
          { activity: { lastName: 'A' } },
          { activity: { lastName: 'B' } },
          { activity: { lastName: 'C' } },
        ])
      })

      it('descending', () => {
        sortHouseBlockData(data, 'lastName', 'DESC')
        expect(data).toEqual([
          { activity: { lastName: 'C' } },
          { activity: { lastName: 'B' } },
          { activity: { lastName: 'A' } },
        ])
      })
    })

    describe('others[0]', () => {
      const data = [{ others: [{ lastName: 'B' }] }, { others: [{ lastName: 'A' }] }, { others: [{ lastName: 'C' }] }]

      it('ascending', () => {
        sortHouseBlockData(data, 'lastName', 'ASC')
        expect(data).toEqual([
          { others: [{ lastName: 'A' }] },
          { others: [{ lastName: 'B' }] },
          { others: [{ lastName: 'C' }] },
        ])
      })

      it('descending', () => {
        sortHouseBlockData(data, 'lastName', 'DESC')
        expect(data).toEqual([
          { others: [{ lastName: 'C' }] },
          { others: [{ lastName: 'B' }] },
          { others: [{ lastName: 'A' }] },
        ])
      })
    })

    describe('mixed', () => {
      const data = [{ others: [{ lastName: 'B' }] }, { activity: { lastName: 'A' } }, { others: [{ lastName: 'C' }] }]

      it('ascending', () => {
        sortHouseBlockData(data, 'lastName', 'ASC')
        expect(data).toEqual([
          { activity: { lastName: 'A' } },
          { others: [{ lastName: 'B' }] },
          { others: [{ lastName: 'C' }] },
        ])
      })

      it('descending', () => {
        sortHouseBlockData(data, 'lastName', 'DESC')
        expect(data).toEqual([
          { others: [{ lastName: 'C' }] },
          { others: [{ lastName: 'B' }] },
          { activity: { lastName: 'A' } },
        ])
      })
    })
  })

  describe('sort by last name, then firstName', () => {
    describe('activity', () => {
      const data = [
        { activity: { lastName: 'B', firstName: 'P' } },
        { activity: { lastName: 'A', firstName: 'Q' } },
        { activity: { lastName: 'A', firstName: 'P' } },
        { activity: { lastName: 'B', firstName: 'Q' } },
      ]

      it('ascending', () => {
        sortHouseBlockData(data, 'lastName', 'ASC')
        expect(data).toEqual([
          { activity: { lastName: 'A', firstName: 'P' } },
          { activity: { lastName: 'A', firstName: 'Q' } },
          { activity: { lastName: 'B', firstName: 'P' } },
          { activity: { lastName: 'B', firstName: 'Q' } },
        ])
      })

      it('descending', () => {
        sortHouseBlockData(data, 'lastName', 'DESC')
        expect(data).toEqual([
          { activity: { lastName: 'B', firstName: 'Q' } },
          { activity: { lastName: 'B', firstName: 'P' } },
          { activity: { lastName: 'A', firstName: 'Q' } },
          { activity: { lastName: 'A', firstName: 'P' } },
        ])
      })
    })
  })

  describe('Sort by cellLocation', () => {
    const data = [
      { activity: { cellLocation: 'MDI-1-2-007' } },
      { others: [{ cellLocation: 'MDI-1-2-006' }] },
      { activity: { cellLocation: 'MDI-1-1-007' } },
    ]

    it('ascending', () => {
      sortHouseBlockData(data, 'cellLocation', 'ASC')
      expect(data).toEqual([
        { activity: { cellLocation: 'MDI-1-1-007' } },
        { others: [{ cellLocation: 'MDI-1-2-006' }] },
        { activity: { cellLocation: 'MDI-1-2-007' } },
      ])
    })
  })

  describe('Sort by activity (eventDescription), then lastName, then firstName', () => {
    const data = [
      { activity: { event: 'PA', comment: 'B' } },
      { activity: { eventType: 'PRISON_ACT', comment: 'A' } },
      { activity: { comment: 'D', eventDescription: 'F' } },
      { activity: { comment: 'D', eventDescription: 'E' } },
      { activity: { eventDescription: 'C' } },
      { activity: { eventDescription: 'C', lastName: 'B', firstName: 'P' } },
      { activity: { eventDescription: 'C', lastName: 'A', firstName: 'Q' } },
      { activity: { eventDescription: 'C', lastName: 'A', firstName: 'P' } },
      { activity: { eventDescription: 'C', lastName: 'B', firstName: 'Q' } },
    ]
    it('sorts ascending', () => {
      sortHouseBlockData(data, 'activity', 'ASC')
      expect(data).toEqual([
        { activity: { eventType: 'PRISON_ACT', comment: 'A' } },
        { activity: { event: 'PA', comment: 'B' } },
        { activity: { eventDescription: 'C', lastName: 'A', firstName: 'P' } },
        { activity: { eventDescription: 'C', lastName: 'A', firstName: 'Q' } },
        { activity: { eventDescription: 'C', lastName: 'B', firstName: 'P' } },
        { activity: { eventDescription: 'C', lastName: 'B', firstName: 'Q' } },
        { activity: { eventDescription: 'C' } },
        { activity: { comment: 'D', eventDescription: 'E' } },
        { activity: { comment: 'D', eventDescription: 'F' } },
      ])
    })
  })
})
