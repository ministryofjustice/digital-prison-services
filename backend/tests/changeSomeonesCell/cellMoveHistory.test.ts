import cellMoveHistoryFactory from '../../controllers/cellMove/cellMoveHistory'

describe('Cell move history', () => {
  const prisonApi = {}
  const whereaboutsApi = {}

  let req
  let res
  let controller
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
    prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getStaffDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
    prisonApi.getPrisoners = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
    prisonApi.getOffenderCellHistory = jest.fn().mockResolvedValue({ content: [] })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchGroups' does not exist on type '{}... Remove this comment to see the full error message
    whereaboutsApi.searchGroups = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocationPrefix' does not e... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocationPrefix = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCellMoveReasonTypes' does not exist o... Remove this comment to see the full error message
    prisonApi.getCellMoveReasonTypes = jest.fn().mockResolvedValue([
      { code: 'ADM', description: 'Administrative' },
      { code: 'SA', description: 'Safety' },
    ])

    req = {
      query: {
        date: '2020-10-12',
      },
    }
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
      },
    }
    controller = cellMoveHistoryFactory({ prisonApi, whereaboutsApi })
  })

  it('should redirect back to the parent page when no date is supplied', async () => {
    delete req.query
    await controller(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/change-someones-cell/recent-cell-moves')
  })

  it('should make a request for cell move for the date passed in', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
    expect(prisonApi.getHistoryByDate).toHaveBeenCalledWith(expect.anything(), {
      assignmentDate: '2020-10-12',
      agencyId: 'MDI',
    })
  })

  it('should return the page header correctly formatted', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2020-02-07').getTime())

    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'changeSomeonesCell/cellMoveHistory.njk',
      expect.objectContaining({
        title: `Cell moves completed on Monday 12 October 2020`,
      })
    )

    jest.useRealTimers()
  })

  describe('should return cell move history for the given date', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
      prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
        {
          bookingId: -34,
          livingUnitId: -16,
          assignmentDate: '2020-02-03',
          assignmentDateTime: '2020-02-03T11:00:00',
          assignmentReason: 'ADM',
          agencyId: 'MDI',
          description: 'MDI-H-1-2',
          bedAssignmentHistorySequence: 3,
          movementMadeBy: 'SA',
          offenderNo: 'A12345',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getPrisoners = jest
        .fn()
        .mockResolvedValue([{ bookingId: -34, offenderNo: 'A12345', firstName: 'BOB', lastName: 'LAST' }])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getStaffDetails' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getStaffDetails = jest.fn().mockResolvedValue({ username: 'SA', firstName: 'LOU', lastName: 'Becker' })
    })

    it('should return defaults', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
      prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
        {
          bookingId: -34,
          livingUnitId: -16,
          assignmentDateTime: '2020-02-03T11:00:00',
          agencyId: 'MDI',
          description: 'MDI-H-1-2',
          movementMadeBy: 'SA',
          offenderNo: 'A12345',
        },
      ])
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              movedFrom: 'No cell allocated',
              reason: 'Not entered',
            }),
          ],
        })
      )
    })

    it('should return the offenders name properly formatted, and the offender number', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisoners' does not exist on type '{}... Remove this comment to see the full error message
      prisonApi.getPrisoners = jest
        .fn()
        .mockResolvedValue([{ bookingId: -34, offenderNo: 'A12345', firstName: 'BOB', lastName: 'LAST' }])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              prisonerName: 'Last, Bob',
              offenderNo: 'A12345',
            }),
          ],
        })
      )
    })

    it('should return the location the offender was moved to', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              movedTo: 'H-1-2',
            }),
          ],
        })
      )
    })

    it('should return the name of staff member who made the assignment in the correct format', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              movedBy: 'Lou Becker',
            }),
          ],
        })
      )
    })

    it('should return reason for moving', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              reason: 'Administrative',
            }),
          ],
        })
      )
    })

    it('should return the time of the moment in the correct format', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              time: '11:00',
            }),
          ],
        })
      )
    })

    it('should format locations correctly', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
      prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
        {
          assignmentDate: '2016-11-01',
          assignmentEndDate: '2020-02-03',
          agencyId: 'MDI',
          description: 'MDI-RECP',
          bedAssignmentHistorySequence: 2,
          offenderNo: 'A12345',
        },
        {
          assignmentDate: '2016-11-09',
          assignmentReason: 'ADM',
          assignmentEndDate: '2016-11-16',
          agencyId: 'MDI',
          description: 'MDI-COURT',
          bedAssignmentHistorySequence: 3,
          offenderNo: 'A12345',
        },
        {
          assignmentDate: '2016-11-09',
          assignmentReason: 'ADM',
          assignmentEndDate: '2016-11-16',
          agencyId: 'MDI',
          description: 'MDI-CSWAP',
          bedAssignmentHistorySequence: 3,
          offenderNo: 'A12345',
        },
      ])

      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'changeSomeonesCell/cellMoveHistory.njk',
        expect.objectContaining({
          historyByDate: [
            expect.objectContaining({
              movedTo: 'Reception',
            }),
            expect.objectContaining({
              movedTo: 'Court',
            }),
            expect.objectContaining({
              movedTo: 'No cell allocated',
            }),
          ],
        })
      )
    })

    it('should make a call for offender cell history limiting paged results by 20', async () => {
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
      expect(prisonApi.getOffenderCellHistory).toHaveBeenCalledWith(
        {
          user: {
            activeCaseLoad: {
              caseLoadId: 'MDI',
            },
          },
        },
        undefined,
        { page: 0, size: 20 }
      )
    })

    describe('Filtering', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
        prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
          {
            assignmentDate: '2016-11-01',
            assignmentEndDate: '2020-02-03',
            agencyId: 'MDI',
            description: 'MDI-1-2-3',
            bedAssignmentHistorySequence: 1,
            offenderNo: 'A12345',
            assignmentReason: 'ADM',
          },
          {
            assignmentDate: '2016-11-01',
            assignmentEndDate: '2020-02-03',
            agencyId: 'MDI',
            description: 'MDI-2-2-3',
            bedAssignmentHistorySequence: 1,
            offenderNo: 'A12345',
            assignmentReason: 'BEH',
          },
          {
            assignmentDate: '2016-11-09',
            assignmentEndDate: '2016-11-16',
            agencyId: 'LEI',
            description: 'LEI-COURT',
            bedAssignmentHistorySequence: 1,
            offenderNo: 'A12345',
            assignmentReason: 'BEH',
          },
          {
            assignmentDate: '2016-11-09',
            assignmentEndDate: '2016-11-16',
            agencyId: 'LEI',
            description: 'LEI-CSWAP',
            bedAssignmentHistorySequence: 1,
            offenderNo: 'A12345',
            assignmentReason: 'BEH',
          },
        ])
      })

      it('should filter by location', async () => {
        res.locals = {
          ...res.locals,
          user: {
            activeCaseLoad: {
              caseLoadId: 'LEI',
            },
          },
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocationPrefix' does not e... Remove this comment to see the full error message
        whereaboutsApi.getAgencyGroupLocationPrefix = jest.fn().mockResolvedValue({ locationPrefix: 'LEI-' })

        req.query.locationId = 'House block 1'
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'changeSomeonesCell/cellMoveHistory.njk',
          expect.objectContaining({
            historyByDate: [
              expect.objectContaining({
                movedTo: 'Court',
              }),
              expect.objectContaining({
                movedTo: 'No cell allocated',
              }),
            ],
          })
        )
      })

      it('should filter by movement reason', async () => {
        req.query.reason = 'ADM'
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'changeSomeonesCell/cellMoveHistory.njk',
          expect.objectContaining({
            historyByDate: [
              expect.objectContaining({
                reason: 'Administrative',
                movedTo: '1-2-3',
              }),
            ],
          })
        )
      })
    })

    describe('Previous location', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
        prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
          {
            livingUnitId: 1,
            assignmentDate: '2020-02-03',
            agencyId: 'MDI',
            description: 'MDI-H-1-2',
            offenderNo: 'A12345',
          },
        ])
      })
      it('should return the moved from location', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
        prisonApi.getOffenderCellHistory = jest.fn().mockResolvedValue({
          content: [
            {
              livingUnitId: 10,
              assignmentDate: '2016-11-01',
              assignmentEndDate: '2020-02-03',
              agencyId: 'MDI',
              description: 'MDI-COURT',
              bedAssignmentHistorySequence: 2,
              offenderNo: 'A12345',
            },
            {
              livingUnitId: 20,
              assignmentDate: '2016-11-09',
              assignmentReason: 'ADM',
              assignmentEndDate: '2016-11-16',
              agencyId: 'MDI',
              description: 'MDI-H3-B3-018',
              bedAssignmentHistorySequence: 3,
              offenderNo: 'A12345',
            },
          ],
        })

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'changeSomeonesCell/cellMoveHistory.njk',
          expect.objectContaining({
            historyByDate: [
              expect.objectContaining({
                movedFrom: 'Court',
              }),
            ],
          })
        )
      })

      it('should use latest move when there are multiple for the same day', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderCellHistory' does not exist o... Remove this comment to see the full error message
        prisonApi.getOffenderCellHistory = jest.fn().mockResolvedValue({
          content: [
            {
              livingUnitId: 10,
              assignmentDate: '2016-11-01',
              assignmentEndDate: '2020-02-03',
              agencyId: 'MDI',
              description: 'MDI-H3-B2-014',
              bedAssignmentHistorySequence: 1,
              offenderNo: 'A12345',
            },
            {
              livingUnitId: 20,
              assignmentDate: '2016-11-01',
              assignmentReason: 'ADM',
              assignmentEndDate: '2020-02-03',
              agencyId: 'MDI',
              description: 'MDI-H3-B2-013',
              bedAssignmentHistorySequence: 2,
              offenderNo: 'A12345',
            },
            {
              livingUnitId: 1,
              assignmentDate: '2020-02-03',
              assignmentEndDate: '2020-02-03',
              agencyId: 'MDI',
              description: 'MDI-H-1-2',
              bedAssignmentHistorySequence: 3,
              offenderNo: 'A12345',
            },
          ],
        })

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'changeSomeonesCell/cellMoveHistory.njk',
          expect.objectContaining({
            historyByDate: [
              expect.objectContaining({
                movedFrom: 'H3-B2-013',
              }),
            ],
          })
        )
      })

      it('should sort by latest assignment date time', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getHistoryByDate' does not exist on type... Remove this comment to see the full error message
        prisonApi.getHistoryByDate = jest.fn().mockResolvedValue([
          {
            assignmentDate: '2020-02-03',
            assignmentDateTime: '2020-02-03T20:10:11',
            agencyId: 'MDI',
            description: 'MDI-H-1-2',
            offenderNo: 'A12345',
          },
          {
            assignmentDate: '2020-02-03',
            assignmentDateTime: '2020-02-03T10:10:11',
            agencyId: 'MDI',
            description: 'MDI-H-1-3',
            offenderNo: 'A12345',
          },
        ])

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'changeSomeonesCell/cellMoveHistory.njk',
          expect.objectContaining({
            historyByDate: [
              expect.objectContaining({
                movedTo: 'H-1-2',
                time: '20:10',
              }),
              expect.objectContaining({
                movedTo: 'H-1-3',
                time: '10:10',
              }),
            ],
          })
        )
      })
    })
  })
})
