const { isToday } = require('../utils');

module.exports = async (elite2Api, context, { offenderNumbers, formattedDate, agencyId }) => {
  if (!offenderNumbers || offenderNumbers.length === 0) return [];

  const [
    releaseScheduleData,
    courtEventData,
    transferData
  ] = await getExternalEvents(elite2Api, context, { offenderNumbers, agencyId, formattedDate });

  return reduceToMap(
    offenderNumbers,
    formattedDate,
    releaseScheduleData,
    courtEventData,
    transferData
  );
};

const getExternalEvents = (elite2Api, context, { offenderNumbers, agencyId, formattedDate }) => {
  return Promise.all([
    elite2Api.getSentenceData(context, offenderNumbers),
    isToday(formattedDate) ? elite2Api.getCourtEvents(context, { agencyId, date: formattedDate, offenderNumbers }) : [],
    elite2Api.getExternalTransfers(context, { agencyId, date: formattedDate, offenderNumbers })
  ]);
};

const reduceToMap = (offenderNumbers, formattedDate, releaseScheduleData, courtEventData, transferData) =>
  offenderNumbers.reduce((map, offenderNumber) => {
    const offenderData = {
      releaseScheduled: releaseScheduled(releaseScheduleData, offenderNumber, formattedDate),
      atCourt: atCourt(courtEventData, offenderNumber),
      scheduledTransfers: scheduledTransfers(transferData, offenderNumber)
    };
    return map.set(offenderNumber, offenderData);
  }, new Map());

const releaseScheduled = (releaseScheduledData, offenderNo, formattedDate) => {
  return Boolean(releaseScheduledData && releaseScheduledData.length && releaseScheduledData
    .filter(release => release.offenderNo === offenderNo &&
        release.sentenceDetail.releaseDate === formattedDate)[0]);
};

const atCourt = (courtEvents, offenderNo) => {
  return Boolean(courtEvents && courtEvents.length && courtEvents
    .filter(courtEvent => courtEvent.offenderNo === offenderNo)[0]);
};

const scheduledTransfers = (transfers, offenderNo) => {
  return (transfers && transfers.length && transfers
    .filter(transfer => transfer.offenderNo === offenderNo)
    .map(event => ({
      eventId: event.eventId,
      eventDescription: 'Transfer scheduled',
      ...transferStatus(event.eventStatus)
    }))) || [];
};

const transferStatus = (eventStatus) => {
  switch (eventStatus) {
    case 'SCH': return { scheduled: true };
    case 'CANC': return { cancelled: true };
    case 'EXP': return { expired: true };
    case 'COMP': return { complete: true };
    default: return { unCheckedStatus: eventStatus };
  }
};

