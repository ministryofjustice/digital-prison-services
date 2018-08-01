/* eslint-disable no-lonely-if */
const log = require('../log');
const switchDateFormat = require('../utils');
const moment = require('moment');

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
          currentRow.activity = [event];
        } else {
          currentRow.activity.push(event);
          currentRow.activity.sort(function (a, b) {
            return safeTimeCompare(a, b);
          });
        }
      } else {
        // set array of non-paid appointments or visits
        if (!currentRow.others) {
          currentRow.others = [event];
        } else {
          currentRow.others.push(event);
        }
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
