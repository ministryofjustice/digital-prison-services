const activity1_1 = require('./activity1_1')
const activity1_2 = require('./activity1_2')
const activity1_3 = require('./activity1_3')
const activity2 = require('./activity2')
const activity3 = require('./activity3')
const appointment1 = require('./appointment1')
const visit1 = require('./visit1')

module.exports = {
  activities: [activity1_1, activity1_2, activity1_3, activity2, activity3],
  pastActivities: [activity1_1, activity1_2, activity2],
  activity3,
  visits: [visit1],
  appointments: [appointment1],
}
