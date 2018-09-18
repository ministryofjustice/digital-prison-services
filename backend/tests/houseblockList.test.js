Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const moment = require('moment');
const elite2ApiFactory = require('../api/elite2Api').elite2ApiFactory;
const elite2Api = elite2ApiFactory(null);
const houseblockList = require('../controllers/houseblockList').getHouseblockListFactory(elite2Api).getHouseblockList;

const { distinct, switchDateFormat } = require('../utils');

describe('Houseblock list controller', async () => {
  beforeEach(() => {
    elite2Api.getHouseblockList = jest.fn();
    elite2Api.getSentenceData = jest.fn();
    elite2Api.getExternalTransfers = jest.fn();
    elite2Api.getCourtEvents = jest.fn();
  });

  it('Should add visit and appointment details to array', async () => {
    elite2Api.getHouseblockList.mockImplementationOnce(() => createResponse());

    const response = await houseblockList({});

    expect(elite2Api.getHouseblockList.mock.calls.length).toBe(1);

    expect(response.length).toBe(4);

    expect(response[0].activity.offenderNo).toBe('A1234AA');
    expect(response[0].activity.firstName).toBe('ARTHUR');
    expect(response[0].activity.lastName).toBe('ANDERSON');
    expect(response[0].activity.cellLocation).toBe("LEI-A-1-1");
    expect(response[0].activity.event).toBe("CHAP");
    expect(response[0].activity.eventType).toBe("PRISON_ACT");
    expect(response[0].activity.eventDescription).toBe('Earliest paid activity');
    expect(response[0].activity.comment).toBe("commentEarliest");
    expect(response[0].activity.startTime).toBe('2017-10-15T17:30:00');
    expect(response[0].activity.endTime).toBe('2017-10-15T18:30:00');

    expect(response[0].others.length).toBe(3);
    expect(response[0].others[0].offenderNo).toBe('A1234AA');
    expect(response[0].others[0].firstName).toBe('ARTHUR');
    expect(response[0].others[0].lastName).toBe('ANDERSON');
    expect(response[0].others[0].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].others[0].event).toBe('VISIT');
    expect(response[0].others[0].eventDescription).toBe('Official Visit');
    expect(response[0].others[0].comment).toBe('comment18');
    expect(response[0].others[0].startTime).toBe('2017-10-15T19:00:00');
    expect(response[0].others[0].endTime).toBe('2017-10-15T20:30:00');

    expect(response[0].others[1].offenderNo).toBe('A1234AA');
    expect(response[0].others[1].firstName).toBe('ARTHUR');
    expect(response[0].others[1].lastName).toBe('ANDERSON');
    expect(response[0].others[1].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].others[1].event).toBe('CHAP');
    expect(response[0].others[1].eventDescription).toBe('Chapel');
    expect(response[0].others[1].comment).toBe('comment11');
    expect(response[0].others[1].startTime).toBeUndefined();
    expect(response[0].others[1].endTime).toBe('2017-10-15T18:30:00');

    expect(response[0].others[2].offenderNo).toBe('A1234AA');
    expect(response[0].others[2].firstName).toBe('ARTHUR');
    expect(response[0].others[2].lastName).toBe('ANDERSON');
    expect(response[0].others[2].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].others[2].event).toBe('GYM');
    expect(response[0].others[2].eventDescription).toBe('The gym, appointment');
    expect(response[0].others[2].comment).toBe('comment14');
    expect(response[0].others[2].startTime).toBe('2017-10-15T17:00:00');
    expect(response[0].others[2].endTime).toBe('2017-10-15T17:30:00');

    expect(response[1].activity.offenderNo).toBe('A1234AB');
    expect(response[1].others).toBeUndefined(); //no non paid activities

    expect(response[2].others.length).toBe(1);
    expect(response[2].activity.offenderNo).toBe('A1234AC');
    expect(response[2].activity.event).toBe('CHAP');
    expect(response[2].others[0].offenderNo).toBe('A1234AC');
    expect(response[2].others[0].event).toBe('VISIT');

    expect(response[3].activity).toBeUndefined(); //no activities
    expect(response[3].others[0].offenderNo).toBe('A1234AD');
  });

  it('Should correctly choose main activity', async () => {
    elite2Api.getHouseblockList.mockImplementationOnce(() => createMultipleActivities());

    const response = await houseblockList({});

    expect(response.length).toBe(1);

    expect(response[0].activity.eventDescription).toBe('paid early');
    expect(response[0].activity.startTime).toBe('2017-10-15T08:30:00');

    expect(response[0].others.length).toBe(2);
    expect(response[0].others[0].eventDescription).toBe('unpaid early');
    expect(response[0].others[0].startTime).toBe('2017-10-15T08:00:00');
    expect(response[0].others[1].eventDescription).toBe('paid later');
    expect(response[0].others[1].startTime).toBe('2017-10-15T09:00:00');
  });

  it('Should correctly choose between multiple unpaid', async () => {
    elite2Api.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid());

    const response = await houseblockList({});

    expect(response.length).toBe(1);

    expect(response[0].activity.eventDescription).toBe('unpaid early');
    expect(response[0].activity.startTime).toBe('2017-10-15T08:00:00');

    expect(response[0].others.length).toBe(2);
    expect(response[0].others[0].eventDescription).toBe('unpaid later');
    expect(response[0].others[0].startTime).toBe('2017-10-15T09:00:00');
    expect(response[0].others[1].eventDescription).toBe('unpaid middle');
    expect(response[0].others[1].startTime).toBe('2017-10-15T08:30:00');
  });

  it('Should handle no response data', async () => {
    elite2Api.getHouseblockList.mockImplementationOnce(() => []);

    const response = await houseblockList({});

    expect(elite2Api.getHouseblockList.mock.calls.length).toBe(1);
    expect(response.length).toBe(0);

    expect(elite2Api.getSentenceData.mock.calls.length).toBe(0);
    expect(elite2Api.getCourtEvents.mock.calls.length).toBe(0);
    expect(elite2Api.getExternalTransfers.mock.calls.length).toBe(0);
  });

  it('should fetch sentence data for all offenders in a house block', async () => {
    elite2Api.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid());

    await houseblockList({});

    const offenderNumbers = createMultipleUnpaid().map(e => e.offenderNo);

    expect(elite2Api.getSentenceData).toHaveBeenCalledWith({}, distinct(offenderNumbers));
  });

  it('should return multiple scheduled transfers along with status descriptions', async () => {
    const today = moment();

    elite2Api.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid());

    elite2Api.getExternalTransfers.mockImplementationOnce(() => [
      {
        firstName: "BYSJANHKUMAR",
        lastName: "HENRINEE",
        offenderNo: "A1234AA",
        startTime: switchDateFormat(moment()),
        eventStatus: 'SCH'
      },
      {
        firstName: "BYSJANHKUMAR",
        lastName: "HENRINEE",
        offenderNo: "A1234AA",
        startTime: switchDateFormat(moment()),
        eventStatus: 'EXP'
      },
      {
        firstName: "BYSJANHKUMAR",
        lastName: "HENRINEE",
        offenderNo: "A1234AA",
        startTime: switchDateFormat(moment()),
        eventStatus: 'CANC'
      },
      {
        firstName: "BYSJANHKUMAR",
        lastName: "HENRINEE",
        offenderNo: "A1234AA",
        startTime: switchDateFormat(moment()),
        eventStatus: 'COMP'
      }
    ]);

    const response = await houseblockList({}, 'LEI', 'GROUP1', today, 'AM');

    expect(response[0].scheduledTransfers).toEqual([
      {
        eventDescription: 'Transfer scheduled',
        scheduled: true
      },
      {
        eventDescription: 'Transfer scheduled',
        expired: true
      },
      {
        eventDescription: 'Transfer scheduled',
        cancelled: true
      },
      {
        eventDescription: 'Transfer scheduled',
        complete: true
      }
    ]);
  });
});

// There can be more than one occupant of a cell, the results are ordered by cell,offenderNo or cell,surname from the api.
function createResponse () {
  return [
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "CHAP",
      eventType: "PRISON_ACT",
      eventDescription: "Chapel",
      comment: "comment11",
      endTime: "2017-10-15T18:30:00"
    },
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "VISIT",
      eventType: "VISIT",
      eventDescription: "Official Visit",
      comment: "comment18",
      startTime: "2017-10-15T19:00:00",
      endTime: "2017-10-15T20:30:00"
    },
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "CHAP",
      eventType: "PRISON_ACT",
      eventDescription: "Earliest paid activity",
      payRate: 1.3,
      comment: "commentEarliest",
      startTime: "2017-10-15T17:30:00",
      endTime: "2017-10-15T18:30:00"
    },
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "GYM",
      eventType: "APP",
      eventDescription: "The gym, appointment",
      comment: "comment14",
      startTime: "2017-10-15T17:00:00",
      endTime: "2017-10-15T17:30:00"
    },
    {
      offenderNo: "A1234AB",
      firstName: "MICHAEL",
      lastName: "SMITH",
      cellLocation: "LEI-A-1-1",
      event: "CHAP",
      eventType: "PRISON_ACT",
      eventDescription: "Chapel",
      comment: "comment12",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: "LEI-A-1-3",
      event: "CHAP",
      eventType: "PRISON_ACT",
      payRate: 1.3,
      eventDescription: "Chapel Activity",
      comment: "comment13",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: "LEI-A-1-3",
      event: "VISIT",
      eventType: "VISIT",
      eventDescription: "Family Visit",
      comment: "comment19",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    {
      offenderNo: "A1234AD",
      firstName: "ONLY",
      lastName: "Visits",
      cellLocation: "LEI-A-1-7",
      event: "VISIT",
      eventType: "VISIT",
      eventDescription: "Family Visit",
      comment: "only unpaid visit",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  ];
}

function createMultipleActivities () {
  return [
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "paid later",
      startTime: "2017-10-15T09:00:00",
      payRate: 0.5
    },
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "unpaid early",
      startTime: "2017-10-15T08:00:00"
    },
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "paid early",
      startTime: "2017-10-15T08:30:00",
      payRate: 0.5
    }
  ];
}

function createMultipleUnpaid () {
  return [
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "unpaid later",
      startTime: "2017-10-15T09:00:00"
    },
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "unpaid early",
      startTime: "2017-10-15T08:00:00"
    },
    {
      offenderNo: "A1234AA",
      eventType: "PRISON_ACT",
      eventDescription: "unpaid middle",
      startTime: "2017-10-15T08:30:00"
    }
  ];
}
