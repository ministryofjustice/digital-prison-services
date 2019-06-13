Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const whereaboutsApi = {}
const config = {
  updateAttendancePrisons: ['ABC'],
}
const activityList = require('../controllers/activityList').getActivityListFactory(elite2Api, whereaboutsApi, config)
  .getActivityList

describe('Activity list update attendance when agencyId is not in list of enabled prisons', () => {
  beforeEach(() => {
    elite2Api.getActivityList = jest.fn()
    elite2Api.getVisits = jest.fn()
    elite2Api.getAppointments = jest.fn()
    elite2Api.getActivities = jest.fn()
    elite2Api.getSentenceData = jest.fn()
    elite2Api.getCourtEvents = jest.fn()
    elite2Api.getExternalTransfers = jest.fn()
    elite2Api.getAlerts = jest.fn()
    elite2Api.getAssessments = jest.fn()
    whereaboutsApi.getAttendance = jest.fn()
    elite2Api.getVisits.mockReturnValue([])
    elite2Api.getAppointments.mockReturnValue([])
    elite2Api.getActivities.mockReturnValue([])
    elite2Api.getActivityList.mockImplementation((context, { usage }) => {
      switch (usage) {
        case 'PROG':
          return [{ offenderNo: 'A', comment: 'aa', lastName: 'b' }]
        default:
          return []
      }
    })
  })

  it('should not call the whereaboutsApi endpoint', async () => {
    await activityList({}, 'LEI', 1, '23/11/2018', 'PM')

    expect(whereaboutsApi.getAttendance).not.toHaveBeenCalled()
  })
})
