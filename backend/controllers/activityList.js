const switchDateFormat = require('../utils');
const log = require('../log');

const sortActivitiesByEventThenByLastName = (data) => {
  data.sort((a, b) => {
    if (a.comment < b.comment) return -1;
    if (a.comment > b.comment) return 1;

    if (a.lastName < b.lastName) return -1;
    if (a.lastName > b.lastName) return 1;

    return 0;
  });

  return data;
};

const getActivityListFactory = (elite2Api) => {
  const getActivityList = async (context, agencyId, locationId, frontEndDate, timeSlot) => {
    const date = switchDateFormat(frontEndDate);

    const activityData = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'PROG', date, timeSlot });
    log.info(activityData, 'getActivityList data received');

    const offenderNumbers = activityData && activityData.map(activity => activity.offenderNo);

    const visits = activityData && await elite2Api.getVisits(context, { agencyId, date, timeSlot, offenderNumbers });
    log.info(visits, 'getVisits data received');

    const appointments = activityData && await elite2Api.getAppointments(context, { agencyId, date, timeSlot, offenderNumbers });
    log.info(appointments, 'getAppointments data received');

    const activities = sortActivitiesByEventThenByLastName(activityData);

    if (activities) {
      for (const row of activities) {
        if (visits) {
          row.visits = visits.filter(details => details.offenderNo === row.offenderNo);
        }
        if (appointments) {
          row.appointments = appointments.filter(details => details.offenderNo === row.offenderNo);
        }
      }
    }
    return activities;
  };

  return {
    getActivityList
  };
};

module.exports = { getActivityListFactory };
