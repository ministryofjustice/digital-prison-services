/* eslint-disable no-lonely-if */
const log = require('../log');
const switchDateFormat = require('../utils');
const moment = require('moment');

function addToOthers (currentRow, event) {
  if (!currentRow.others) {
    // set array of non-paid activities, appointments or visits
    currentRow.others = [event];
  } else {
    currentRow.others.push(event);
  }
}

const getHouseblockListFactory = (elite2Api) => {
  const getHouseblockList = async (context, agencyId, groupName, date, timeSlot) => {
    const data = await elite2Api.getHouseblockList(context, agencyId, groupName, switchDateFormat(date), timeSlot);
    // Returns array ordered by inmate/cell or name, then start time

    log.info(data, 'getHouseblockList data received');
    const rows = [];
    let i = -1;
    let lastOffenderNo = '';
    for (const event of data) {
      if (event.offenderNo !== lastOffenderNo) {
        i++;
        lastOffenderNo = event.offenderNo;
        rows[i] = {};
      }

      let currentRow = rows[i];
      if (event.eventType === 'PRISON_ACT') {
        if (!currentRow.activity) {
          // 1st activity found for this offender
          currentRow.activity = event;
        } else {
          // Multiple activities - make paid the main one
          if (!currentRow.activity.payRate && event.payRate) {
            addToOthers(currentRow, currentRow.activity);
            currentRow.activity = event;
          } else if ((currentRow.activity.payRate && event.payRate) ||
                     (!currentRow.activity.payRate && !event.payRate)) {
            // Multiple paid activities, or neither paid - make earliest the main one
            if (safeTimeCompare(currentRow.activity.startTime, event.startTime)) {
              addToOthers(currentRow, currentRow.activity);
              currentRow.activity = event;
            } else {
              // event later
              addToOthers(currentRow, event);
            }
          } else if (currentRow.activity.payRate && !event.payRate) {
            addToOthers(currentRow, event);
          }
        }
      } else {
        addToOthers(currentRow, event);
      }
    }
    return rows;
  };

  return {
    getHouseblockList
  };
};

function safeTimeCompare (a, b) {
  if (a.startTime && b.startTime) {
    return moment(b.startTime).isBefore(a.startTime);
  } else {
    return !a.startTime;
  }
}

module.exports = { getHouseblockListFactory };
