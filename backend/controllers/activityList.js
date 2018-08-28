const switchDateFormat = require('../utils');
const log = require('../log');
const moment = require('moment');

const sortActivitiesByEventThenByLastName = (data) => {
  data.sort((a, b) => {
    if (a.comment < b.comment) return -1;
    if (a.comment > b.comment) return 1;

    if (a.lastName < b.lastName) return -1;
    if (a.lastName > b.lastName) return 1;

    return 0;
  });
};

const sortEventsByStartTime = (events) => {
  events.sort((event1, event2) => {
    const t1 = event1.startTime;
    const t2 = event2.startTime;

    if (t1 && t2) {
      return moment(t1).valueOf() - moment(t2).valueOf();
    } else if (t1) {
      return -1;
    } else if (t2) {
      return 1;
    }
    return 0;
  });
};

const offenderNumberMultimap = (offenderNumbers) => offenderNumbers.reduce(
  (map, offenderNumber) => map.set(offenderNumber, []),
  new Map()
);

const getActivityListFactory = (elite2Api) => {
  const getActivityList = async (context, agencyId, locationIdString, frontEndDate, timeSlot) => {
    const locationId = Number.parseInt(locationIdString, 10);
    const date = switchDateFormat(frontEndDate);

    const getEventsForOffenderNumbers = async (offenderNumbers) => {
      const searchCriteria = { agencyId, date, timeSlot, offenderNumbers };
      const eventsByKind = await Promise.all([
        elite2Api.getVisits(context, searchCriteria),
        elite2Api.getAppointments(context, searchCriteria),
        elite2Api.getActivities(context, searchCriteria)
      ]);
      return [...(eventsByKind[0]), ...(eventsByKind[1]), ...(eventsByKind[2])]; // Meh. No flatMap or flat.
    };

    const getEventsAtLocation = (usage) => elite2Api.getActivityList(context, { agencyId, locationId, usage, date, timeSlot });

    const eventsAtLocationByUsage = (await Promise.all([
      getEventsAtLocation('PROG'),
      getEventsAtLocation('VISIT'),
      getEventsAtLocation('APP')
    ]));
    const eventsAtLocation = [...(eventsAtLocationByUsage[0]), ...(eventsAtLocationByUsage[1]), ...(eventsAtLocationByUsage[2])]; // Meh. No flatMap or flat.
    log.info(eventsAtLocation, 'events at location');

    const offenderNumbersWithDuplicates = eventsAtLocation.map(event => event.offenderNo);
    const offenderNumbers = [...(new Set(offenderNumbersWithDuplicates))];
    const eventsForOffenderNumbers = await getEventsForOffenderNumbers(offenderNumbers);
    const eventsElsewhere = eventsForOffenderNumbers.filter(event => event.locationId !== locationId);
    const eventsElsewhereByOffenderNumber = offenderNumberMultimap(offenderNumbers);
    eventsElsewhere.forEach(event => {
      const events = eventsElsewhereByOffenderNumber.get(event.offenderNo);
      if (events) events.push(event);
    });
    eventsAtLocation.forEach(event => { event.eventsElsewhere = eventsElsewhereByOffenderNumber.get(event.offenderNo); });
    sortActivitiesByEventThenByLastName(eventsAtLocation);

    eventsAtLocation.forEach(event => sortEventsByStartTime(event.eventsElsewhere));

    return eventsAtLocation;
  };

  return {
    getActivityList
  };
};

module.exports = { getActivityListFactory };
