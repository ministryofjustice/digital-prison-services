const switchDateFormat = require('../utils');
const log = require('../log');

const getActivitiesGroupedByEventThenByLastName = (data) => {
  const groupedByEvent = data.reduce((previous, current) => {
    if (previous[current.comment]) {
      previous[current.comment].push(current);
    } else {
      previous[current.comment] = [current];
    }

    return previous;
  }, {});

  const keys = Object.keys(groupedByEvent).sort();

  if (keys.length) {
    keys.forEach(key => {
      const event = groupedByEvent[key];
      event.sort((a, b) => {
        if (a.lastName < b.lastName) return -1;
        if (a.lastName > b.lastName) return 1;
        return 0;
      });
    });

    return keys.map(key => groupedByEvent[key]).reduce((previous, current) => current.concat(previous), []);
  }

  return null;
};

const getActivityListFactory = (elite2Api) => {
  const getActivityList = async (context, agencyId, locationId, frontEndDate, timeSlot) => {
    const date = switchDateFormat(frontEndDate);

    const sortFields = ['eventDescription', 'lastName'];
    const activityData = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'PROG', date, timeSlot, sortFields });
    log.info(activityData, 'getActivityList data received');
    const visits = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'VISIT', date, timeSlot });
    const appointments = await elite2Api.getActivityList(context, { agencyId, locationId, usage: 'APP', date, timeSlot });

    const activities = getActivitiesGroupedByEventThenByLastName(activityData) || activityData;

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
