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

    expect(response['A1234AA'].length).toBe(3);
    expect(response['A1234AA'][0].offenderNo).toBe('A1234AA');
    expect(response['A1234AA'][0].firstName).toBe('ARTHUR');
    expect(response['A1234AA'][0].lastName).toBe('ANDERSON');
    expect(response['A1234AA'][0].cellLocation).toBe("LEI-A-1-1");
    expect(response['A1234AA'][0].event).toBe("CHAP");
    expect(response['A1234AA'][0].eventDescription).toBe('Chapel');
    expect(response['A1234AA'][0].comment).toBe("comment11");
    expect(response['A1234AA'][0].startTime).toBe('2017-10-15T18:00:00');
    expect(response['A1234AA'][0].endTime).toBe('2017-10-15T18:30:00');
    expect(response['A1234AA'][1].offenderNo).toBe('A1234AA');
    expect(response['A1234AA'][1].firstName).toBe('ARTHUR');
    expect(response['A1234AA'][1].lastName).toBe('ANDERSON');
    expect(response['A1234AA'][1].cellLocation).toBe('LEI-A-1-1');
    expect(response['A1234AA'][1].event).toBe('VISIT');
    expect(response['A1234AA'][1].eventDescription).toBe('Official Visit');
    expect(response['A1234AA'][1].comment).toBe('comment18');
    expect(response['A1234AA'][1].startTime).toBe('2017-10-15T11:00:00');
    expect(response['A1234AA'][1].endTime).toBe('2017-10-15T11:30:00');
    expect(response['A1234AA'][2].offenderNo).toBe('A1234AA');
    expect(response['A1234AA'][2].firstName).toBe('ARTHUR');
    expect(response['A1234AA'][2].lastName).toBe('ANDERSON');
    expect(response['A1234AA'][2].cellLocation).toBe('LEI-A-1-1');
    expect(response['A1234AA'][2].event).toBe('GYM');
    expect(response['A1234AA'][2].eventDescription).toBe('The gym, appointment');
    expect(response['A1234AA'][2].comment).toBe('comment14');
    expect(response['A1234AA'][2].startTime).toBe('2017-10-15T17:00:00');
    expect(response['A1234AA'][2].endTime).toBe('2017-10-15T17:30:00');

    expect(response['A1234AB'].length).toBe(1);
    expect(response['A1234AB'][0].offenderNo).toBe('A1234AB');

    expect(response['A1234AC'].length).toBe(2);
    expect(response['A1234AC'][0].offenderNo).toBe('A1234AC');
    expect(response['A1234AC'][0].event).toBe('CHAP');
    expect(response['A1234AC'][1].offenderNo).toBe('A1234AC');
    expect(response['A1234AC'][1].event).toBe('VISIT');
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
