Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const houseblockList = require('../controllers/houseblockList').getHouseblockList;
const elite2Api = require('../elite2Api');

const req = {
  headers: {
  },
  query: {
  }
};

describe('Houseblock list controller', async () => {
  it('Should add visit and appointment details to activity array', async () => {
    elite2Api.getHouseblockList = jest.fn();
    elite2Api.getHouseblockList.mockImplementationOnce(() => createResponse());

    const response = await houseblockList(req);

    expect(elite2Api.getHouseblockList.mock.calls.length).toBe(1);

    expect(response[0].others.length).toBe(2);
    expect(response[0].activity.offenderNo).toBe('A1234AA');
    expect(response[0].activity.firstName).toBe('ARTHUR');
    expect(response[0].activity.lastName).toBe('ANDERSON');
    expect(response[0].activity.cellLocation).toBe("LEI-A-1-1");
    expect(response[0].activity.event).toBe("CHAP");
    expect(response[0].activity.eventDescription).toBe('Chapel');
    expect(response[0].activity.comment).toBe("comment11");
    expect(response[0].activity.startTime).toBe('2017-10-15T18:00:00');
    expect(response[0].activity.endTime).toBe('2017-10-15T18:30:00');
    expect(response[0].others[0].offenderNo).toBe('A1234AA');
    expect(response[0].others[0].firstName).toBe('ARTHUR');
    expect(response[0].others[0].lastName).toBe('ANDERSON');
    expect(response[0].others[0].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].others[0].event).toBe('VISIT');
    expect(response[0].others[0].eventDescription).toBe('Official Visit');
    expect(response[0].others[0].comment).toBe('comment18');
    expect(response[0].others[0].startTime).toBe('2017-10-15T11:00:00');
    expect(response[0].others[0].endTime).toBe('2017-10-15T11:30:00');
    expect(response[0].others[1].offenderNo).toBe('A1234AA');
    expect(response[0].others[1].firstName).toBe('ARTHUR');
    expect(response[0].others[1].lastName).toBe('ANDERSON');
    expect(response[0].others[1].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].others[1].event).toBe('GYM');
    expect(response[0].others[1].eventDescription).toBe('The gym, appointment');
    expect(response[0].others[1].comment).toBe('comment14');
    expect(response[0].others[1].startTime).toBe('2017-10-15T17:00:00');
    expect(response[0].others[1].endTime).toBe('2017-10-15T17:30:00');

    expect(response[1].others).not.toBeDefined();
    expect(response[1].activity.offenderNo).toBe('A1234AB');

    expect(response[2].others.length).toBe(1);
    expect(response[2].activity.offenderNo).toBe('A1234AC');
    expect(response[2].activity.event).toBe('CHAP');
    expect(response[2].others[0].offenderNo).toBe('A1234AC');
    expect(response[2].others[0].event).toBe('VISIT');
  });
});

function createResponse () {
  return {
    data: [
      {
        offenderNo: "A1234AA",
        firstName: "ARTHUR",
        lastName: "ANDERSON",
        cellLocation: "LEI-A-1-1",
        event: "CHAP",
        eventDescription: "Chapel",
        comment: "comment11",
        startTime: "2017-10-15T18:00:00",
        endTime: "2017-10-15T18:30:00"
      },
      {
        offenderNo: "A1234AA",
        firstName: "ARTHUR",
        lastName: "ANDERSON",
        cellLocation: "LEI-A-1-1",
        event: "VISIT",
        eventDescription: "Official Visit",
        comment: "comment18",
        startTime: "2017-10-15T11:00:00",
        endTime: "2017-10-15T11:30:00"
      },
      {
        offenderNo: "A1234AA",
        firstName: "ARTHUR",
        lastName: "ANDERSON",
        cellLocation: "LEI-A-1-1",
        event: "GYM",
        eventDescription: "The gym, appointment",
        comment: "comment14",
        startTime: "2017-10-15T17:00:00",
        endTime: "2017-10-15T17:30:00"
      },
      {
        offenderNo: "A1234AB",
        firstName: "MICHAEL",
        lastName: "SMITH",
        cellLocation: "LEI-A-1-2",
        event: "CHAP",
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
        eventDescription: "Family Visit",
        comment: "comment19",
        startTime: "2017-10-15T11:00:00",
        endTime: "2017-10-15T18:30:00"
      }
    ]
  };
}
