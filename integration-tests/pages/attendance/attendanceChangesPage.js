const page = require('../page')

const row = i => cy.get('tbody tr').eq(i)

const changeCol = (i, j) =>
  row(i)
    .find('td')
    .eq(j)

const attendanceChangesPage = () =>
  page('Changes to attendance reasons', {
    getChangesRows: i => ({
      name: () => changeCol(i, 0).find('a'),
      prisonNo: () => changeCol(i, 1),
      activity: () => changeCol(i, 2),
      changedFrom: () => changeCol(i, 3),
      changedTo: () => changeCol(i, 4),
      dateAndTime: () => changeCol(i, 5),
      changedBy: () => changeCol(i, 6),
    }),
  })

export default {
  verifyOnPage: attendanceChangesPage,
  goTo: (agencyId, fromDateTime, toDateTime, subHeading) => {
    cy.visit(
      `/attendance-changes?agencyId=${agencyId}&fromDateTime=${fromDateTime}&toDateTime=${toDateTime}&subHeading=${subHeading}`
    )
    return attendanceChangesPage()
  },
}
