const switchDateFormat = require('../utils');
const log = require('../log');

const getActivityListFactory = (elite2Api) => {
  const getActivityList = async (context, agencyId, locationId, frontEndDate, timeSlot) => {
    const date = switchDateFormat(frontEndDate);

    const sortFields = ['eventDescription', 'lastName'];
    const activities = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'PROG', date, timeSlot, sortFields });
    log.info(activities, 'getActivityList data received');
    const visits = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'VISIT', date, timeSlot });
    const appointments = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'APP', date, timeSlot });

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
