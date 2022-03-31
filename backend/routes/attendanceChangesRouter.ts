import moment from 'moment'
import { properCaseName, capitalize, pascalToString } from '../utils'

const toActivitiesMap = (activities) =>
  activities.reduce(
    (acc, current) => ({
      ...acc,
      [current.eventId]: {
        firstName: current.firstName,
        lastName: current.lastName,
        activity: current.comment,
        offenderNo: current.offenderNo,
      },
    }),
    {}
  )

const toUserMap = (userDetails) =>
  userDetails.reduce(
    (acc, current) => ({
      ...acc,
      [current.username]: `${current.firstName} ${current.lastName}`,
    }),
    {}
  )

const sortByLastNameThenByDate = (activitiesMap) => (left, right) => {
  const leftLastName = activitiesMap[left.eventId]?.lastName
  const rightLastName = activitiesMap[right.eventId]?.lastName

  if (leftLastName < rightLastName) return -1
  if (leftLastName > rightLastName) return 1

  const leftDate = moment(left.changedOn)
  const rightDate = moment(right.changedOn)

  if (leftDate.isBefore(rightDate)) return -1
  if (leftDate.isAfter(rightDate)) return 1

  return 0
}

export default ({ prisonApi, whereaboutsApi }) =>
  async (req, res) => {
    const { agencyId, fromDateTime, toDateTime, subHeading } = req.query

    if (!fromDateTime || !toDateTime || !subHeading)
      return res.redirect('/manage-prisoner-whereabouts/attendance-reason-statistics')

    const { changes } = await whereaboutsApi.getAttendanceChanges(res.locals, { fromDateTime, toDateTime })

    if (!changes.length) {
      return res.render('attendanceChanges.njk', {
        subHeading,
        attendanceChanges: [],
      })
    }

    const eventIds = [...new Set(changes.map((change) => change.eventId))]
    const activities = await prisonApi.getScheduledActivities(res.locals, { agencyId, eventIds })

    const userNames = [...new Set(changes.map((change) => change.changedBy))]
    const userDetails = await prisonApi.getUserDetailsList(res.locals, userNames)

    const activitiesMap = toActivitiesMap(activities)
    const userMap = toUserMap(userDetails)

    changes.sort(sortByLastNameThenByDate(activitiesMap))

    const attendanceChanges = changes
      .filter((change) => change.prisonId === agencyId)
      .map((change) => {
        const { firstName, lastName, offenderNo, activity } = activitiesMap[change.eventId] || {}

        return [
          {
            html: `<a href="/prisoner/${offenderNo}" class="govuk-link">${properCaseName(lastName)}, ${properCaseName(
              firstName
            )}</a>`,
            attributes: {
              'data-sort-value': lastName,
            },
          },
          { text: offenderNo },
          { text: activity },
          { text: capitalize(pascalToString(change.changedFrom)) },
          { text: capitalize(pascalToString(change.changedTo)) },
          {
            text: moment(change.changedOn).format('D MMMM YYYY - HH:mm'),
            attributes: {
              'data-sort-value': moment(change.changedOn).unix(),
            },
          },
          { text: userMap[change.changedBy] },
        ]
      })

    return res.render('attendanceChanges.njk', {
      subHeading,
      attendanceChanges,
    })
  }
