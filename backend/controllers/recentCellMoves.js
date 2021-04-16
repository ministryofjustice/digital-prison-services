const moment = require('moment')

const mergeArrays = (result, current) => [...result, ...current]

module.exports = ({ prisonApi }) => async (req, res) => {
  const lastSevenDays = [...Array(7).keys()].map(days =>
    moment()
      .subtract(days, 'day')
      .format('YYYY-MM-DD')
  )

  const cellMoves = (await Promise.all(
    lastSevenDays.map(date =>
      prisonApi.getHistoryByDate(res.locals, {
        assignmentDate: date,
      })
    )
  )).reduce(mergeArrays, [])

  const stats = lastSevenDays.map(date => ({
    date,
    dateDisplay: moment(date, 'YYYY-MM-DD').format('dddd D MMMM YYYY'),
    count: cellMoves.filter(move => move.assignmentDate === date).length,
  }))

  return res.render('changeSomeonesCell/recentCellMoves.njk', {
    stats,
  })
}
