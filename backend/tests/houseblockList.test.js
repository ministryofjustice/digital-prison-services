Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const elite2ApiFactory = require('../api/elite2Api').elite2ApiFactory;
const elite2Api = elite2ApiFactory(null);
const houseblockList = require('../controllers/houseblockList').getHouseblockListFactory(elite2Api).getHouseblockList;

describe('Houseblock list controller', async () => {
  it('Should add visit and appointment details to activity array', async () => {
    elite2Api.getHouseblockList = jest.fn();
    elite2Api.getHouseblockList.mockImplementationOnce(() => createResponse());

    const response = await houseblockList({});

    expect(elite2Api.getHouseblockList.mock.calls.length).toBe(1);

    expect(response.length).toBe(4);

    expect(response[0].others.length).toBe(2);
    expect(response[0].activity[0].offenderNo).toBe('A1234AA');
    expect(response[0].activity[0].firstName).toBe('ARTHUR');
    expect(response[0].activity[0].lastName).toBe('ANDERSON');
    expect(response[0].activity[0].cellLocation).toBe("LEI-A-1-1");
    expect(response[0].activity[0].event).toBe("CHAP");
    expect(response[0].activity[0].eventType).toBe("PRISON_ACT");
    expect(response[0].activity[0].eventDescription).toBe('Earliest paid activity');
    expect(response[0].activity[0].comment).toBe("commentEarliest");
    expect(response[0].activity[0].startTime).toBe('2017-10-15T17:30:00');
    expect(response[0].activity[0].endTime).toBe('2017-10-15T18:30:00');


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
    expect(response[0].others[1].event).toBe('GYM');
    expect(response[0].others[1].eventDescription).toBe('The gym, appointment');
    expect(response[0].others[1].comment).toBe('comment14');
    expect(response[0].others[1].startTime).toBe('2017-10-15T17:00:00');
    expect(response[0].others[1].endTime).toBe('2017-10-15T17:30:00');

    expect(response[0].others[2]).not.toBeDefined();

    expect(response[1].activity[0].offenderNo).toBe('A1234AB');
    expect(response[1].others).not.toBeDefined(); //no non paid activities

    expect(response[2].others.length).toBe(1);
    expect(response[2].activity[0].offenderNo).toBe('A1234AC');
    expect(response[2].activity[0].event).toBe('CHAP');
    expect(response[2].others[0].offenderNo).toBe('A1234AC');
    expect(response[2].others[0].event).toBe('VISIT');

    expect(response[3].activity).not.toBeDefined(); //no paid activities
    expect(response[3].others[0].offenderNo).toBe('A1234AD');
  });

  it('Should handle no response data', async () => {
    elite2Api.getHouseblockList = jest.fn();
    elite2Api.getHouseblockList.mockImplementationOnce(() => []);

    const response = await houseblockList({});

    expect(elite2Api.getHouseblockList.mock.calls.length).toBe(1);
    expect(response.length).toBe(0);
  });
});


// There can be more than one occupant of a cell, the results are ordered by cell,offenderNo or cell,surname from the api.
// the activities are sorted by time in the controller
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
      lastName: "UNPAID",
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
