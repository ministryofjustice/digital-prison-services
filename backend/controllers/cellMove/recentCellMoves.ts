import moment from 'moment'

const mergeArrays = (result, current) => [...result, ...current]

export default ({ prisonApi }) =>
  async (req, res) => {
    const {
      user: { activeCaseLoad },
    } = res.locals

    const lastSevenDays = [...Array(7).keys()].map((days) => moment().subtract(days, 'day').format('YYYY-MM-DD'))

    const cellMoves = (
      await Promise.all(
        lastSevenDays.map((date) =>
          prisonApi.getHistoryByDate(res.locals, {
            assignmentDate: date,
            agencyId: activeCaseLoad.caseLoadId,
          })
        )
      )
    ).reduce(mergeArrays, [])

    const stats = lastSevenDays.map((date) => ({
      date,
      dateDisplay: moment(date, 'YYYY-MM-DD').format('dddd D MMMM YYYY'),
      count: cellMoves.filter((move) => move.assignmentDate === date).length,
    }))

    return res.render('changeSomeonesCell/recentCellMoves.njk', {
      stats,
    })
  }
