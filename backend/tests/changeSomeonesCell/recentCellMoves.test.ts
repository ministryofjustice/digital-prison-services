import recentCellMovesFactory from '../../controllers/cellMove/recentCellMoves'

const dataSets = {
  '2020-02-01': [
    {
      bookingId: -34,
      livingUnitId: -16,
      assignmentDate: '2020-02-01',
      assignmentDateTime: '2019-10-17T11:00:00',
      assignmentReason: 'ADM',
      assignmentEndDate: '2020-01-01',
      assignmentEndDateTime: '2020-01-01T11:00:00',
      agencyId: 'LEI',
      description: 'LEI-H-1-2',
      bedAssignmentHistorySequence: 2,
      movementMadeBy: 'SA',
    },
  ],
  '2020-02-03': [
    {
      bookingId: -34,
      livingUnitId: -16,
      assignmentDate: '2020-02-03',
      assignmentDateTime: '2020-02-03T11:00:00',
      assignmentReason: 'ADM',
      agencyId: 'LEI',
      description: 'LEI-H-1-2',
      bedAssignmentHistorySequence: 3,
      movementMadeBy: 'SA',
    },
    {
      bookingId: -34,
      livingUnitId: -16,
      assignmentDate: '2020-02-03',
      assignmentDateTime: '2020-02-03T11:00:00',
      assignmentReason: 'ADM',
      assignmentEndDate: '2020-04-03',
      assignmentEndDateTime: '2020-04-03T11:00:00',
      agencyId: 'LEI',
      description: 'LEI-H-1-2',
      bedAssignmentHistorySequence: 4,
      movementMadeBy: 'SA',
    },
  ],
}

describe('Recent cell moves', () => {
  const prisonApi = {
    getHistoryByDate: jest.fn(),
  }
  let controller
  let req
  let res

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2020-02-07').getTime())
    prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([])

    res = {
      locals: {
        user: {
          activeCaseLoad: {
            caseLoadId: 'LEI',
          },
        },
      },
      render: jest.fn(),
    }
    req = {}

    controller = recentCellMovesFactory({ prisonApi })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should make a call for cell history for the last 7 days', async () => {
    jest.setSystemTime(new Date('2020-02-07').getTime())

    await controller(req, res)

    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-07',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-06',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-05',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-04',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-03',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-02',
      agencyId: 'LEI',
    })
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-02-01',
      agencyId: 'LEI',
    })
  })

  it('should count all cell moves over the last 7 days, grouping by day', async () => {
    prisonApi.getHistoryByDate = jest
      .fn()
      .mockImplementation((context, { assignmentDate }) => dataSets[assignmentDate] || [])

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('changeSomeonesCell/recentCellMoves.njk', {
      stats: [
        { date: '2020-02-07', dateDisplay: 'Friday 7 February 2020', count: 0 },
        { date: '2020-02-06', dateDisplay: 'Thursday 6 February 2020', count: 0 },
        { date: '2020-02-05', dateDisplay: 'Wednesday 5 February 2020', count: 0 },
        { date: '2020-02-04', dateDisplay: 'Tuesday 4 February 2020', count: 0 },
        { date: '2020-02-03', dateDisplay: 'Monday 3 February 2020', count: 2 },
        { date: '2020-02-02', dateDisplay: 'Sunday 2 February 2020', count: 0 },
        { date: '2020-02-01', dateDisplay: 'Saturday 1 February 2020', count: 1 },
      ],
    })
  })

  it('should only count cell moves for the current caseload', async () => {
    res = {
      locals: {
        user: {
          activeCaseLoad: {
            caseLoadId: 'MDI',
          },
        },
      },
      render: jest.fn(),
    }
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('changeSomeonesCell/recentCellMoves.njk', {
      stats: [
        { date: '2020-02-07', dateDisplay: 'Friday 7 February 2020', count: 0 },
        { date: '2020-02-06', dateDisplay: 'Thursday 6 February 2020', count: 0 },
        { date: '2020-02-05', dateDisplay: 'Wednesday 5 February 2020', count: 0 },
        { date: '2020-02-04', dateDisplay: 'Tuesday 4 February 2020', count: 0 },
        { date: '2020-02-03', dateDisplay: 'Monday 3 February 2020', count: 0 },
        { date: '2020-02-02', dateDisplay: 'Sunday 2 February 2020', count: 0 },
        { date: '2020-02-01', dateDisplay: 'Saturday 1 February 2020', count: 0 },
      ],
    })
  })
})
