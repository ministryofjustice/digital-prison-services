Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const elite2ApiFactory = require('../api/elite2Api').elite2ApiFactory;
const elite2Api = elite2ApiFactory(null);
const activityList = require('../controllers/activityList').getActivityListFactory(elite2Api).getActivityList;

describe('Activity list controller', async () => {
  it('Should add visit and appointment details to activity array', async () => {
    elite2Api.getActivityList = jest.fn();
    elite2Api.getVisits = jest.fn();
    elite2Api.getAppointments = jest.fn();

    elite2Api.getActivityList.mockImplementationOnce(() => createActivitiesResponse());
    elite2Api.getVisits.mockImplementationOnce(() => createVisitsResponse());
    elite2Api.getAppointments.mockImplementationOnce(() => createAppointmentsResponse());

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM');

    expect(elite2Api.getActivityList).toHaveBeenCalled();
    expect(elite2Api.getActivityList.mock.calls[0][1].agencyId).toBe('LEI');
    expect(elite2Api.getActivityList.mock.calls[0][1].date).toBe('2018-11-23');

    expect(elite2Api.getVisits.mock.calls[0][1].agencyId).toBe('LEI');
    expect(elite2Api.getVisits.mock.calls[0][1].date).toBe("2018-11-23");
    expect(elite2Api.getVisits.mock.calls[0][1].timeSlot).toBe("PM");
    expect(elite2Api.getVisits.mock.calls[0][1].offenderNumbers).toEqual(["A1234AC", "A1234AA", "A1234AB"]);

    expect(elite2Api.getAppointments.mock.calls[0][1].agencyId).toBe('LEI');
    expect(elite2Api.getAppointments.mock.calls[0][1].date).toBe("2018-11-23");
    expect(elite2Api.getAppointments.mock.calls[0][1].timeSlot).toBe("PM");
    expect(elite2Api.getAppointments.mock.calls[0][1].offenderNumbers).toEqual(["A1234AC", "A1234AA", "A1234AB"]);

    expect(response[0].offenderNo).toBe('A1234AA');
    expect(response[0].firstName).toBe('ARTHUR');
    expect(response[0].lastName).toBe('ANDERSON');
    expect(response[0].cellLocation).toBe("LEI-A-1-1");
    expect(response[0].event).toBe("CHAP");
    expect(response[0].eventDescription).toBe('Chapel');
    expect(response[0].comment).toBe("comment11");
    expect(response[0].startTime).toBe('2017-10-15T18:00:00');
    expect(response[0].endTime).toBe('2017-10-15T18:30:00');
    expect(response[0].visits.length).toBe(1);
    expect(response[0].visits[0].offenderNo).toBe('A1234AA');
    expect(response[0].visits[0].firstName).toBe('ARTHUR');
    expect(response[0].visits[0].lastName).toBe('ANDERSON');
    expect(response[0].visits[0].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].visits[0].event).toBe('VISIT');
    expect(response[0].visits[0].eventDescription).toBe('Official');
    expect(response[0].visits[0].comment).toBe('comment18');
    expect(response[0].visits[0].startTime).toBe('2017-10-15T11:00:00');
    expect(response[0].visits[0].endTime).toBe('2017-10-15T11:30:00');
    expect(response[0].appointments.length).toBe(1);
    expect(response[0].appointments[0].offenderNo).toBe('A1234AA');
    expect(response[0].appointments[0].firstName).toBe('ARTHUR');
    expect(response[0].appointments[0].lastName).toBe('ANDERSON');
    expect(response[0].appointments[0].cellLocation).toBe('LEI-A-1-1');
    expect(response[0].appointments[0].event).toBe('GYM');
    expect(response[0].appointments[0].eventDescription).toBe('The gym');
    expect(response[0].appointments[0].comment).toBe('comment14');
    expect(response[0].appointments[0].startTime).toBe('2017-10-15T17:00:00');
    expect(response[0].appointments[0].endTime).toBe('2017-10-15T17:30:00');

    expect(response[1].offenderNo).toBe('A1234AB');
    expect(response[1].visits.length).toBe(0);
    expect(response[1].appointments.length).toBe(0);

    expect(response[2].offenderNo).toBe('A1234AC');
    expect(response[2].visits.length).toBe(1);
    expect(response[2].visits[0].offenderNo).toBe('A1234AC');
    expect(response[2].appointments.length).toBe(0);
  });

  it('should order activities by comment then by last name', async () => {
    const results = [
      {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "Z",
        cellLocation: "LEI-A-1-3",
        event: "CHAP",
        eventDescription: "Chapel",
        comment: "Z",
        startTime: "2017-10-15T18:00:00",
        endTime: "2017-10-15T18:30:00"
      }, {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "Y",
        cellLocation: "LEI-A-1-3",
        event: "CHAP",
        eventDescription: "Chapel",
        comment: "Z",
        startTime: "2017-10-15T18:00:00",
        endTime: "2017-10-15T18:30:00"
      }, {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "X",
        cellLocation: "LEI-A-1-3",
        event: "CHAP",
        eventDescription: "Chapel",
        comment: "X",
        startTime: "2017-10-15T18:00:00",
        endTime: "2017-10-15T18:30:00"
      }
    ];

    elite2Api.getActivityList = jest.fn();
    elite2Api.getVisits = jest.fn();
    elite2Api.getAppointments = jest.fn();

    elite2Api.getActivityList.mockImplementationOnce(() => results);
    elite2Api.getVisits.mockImplementationOnce(() => createVisitsResponse());
    elite2Api.getAppointments.mockImplementationOnce(() => createAppointmentsResponse());

    const response = await activityList({}, 'LEI', -1, '23/11/2018', 'PM');

    expect(response[0].comment).toBe('X');
    expect(response[0].lastName).toBe('X');

    expect(response[1].comment).toBe('Z');
    expect(response[1].lastName).toBe('Y');

    expect(response[2].comment).toBe('Z');
    expect(response[2].lastName).toBe('Z');
  });

  it('should not make a call to getVisits and getAppointments when there is no activity data', async () => {
    elite2Api.getActivityList = jest.fn();
    elite2Api.getVisits = jest.fn();
    elite2Api.getAppointments = jest.fn();

    elite2Api.getActivityList.mockImplementationOnce(() => []);

    await activityList({}, 'LEI', -1, '23/11/2018', 'PM');

    expect(elite2Api.getVisits.mock.calls.length).toBe(0);
    expect(elite2Api.getAppointments.mock.calls.length).toBe(0);
  });
});

function createActivitiesResponse () {
  return [
    {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: "LEI-A-1-3",
      event: "CHAP",
      eventDescription: "Chapel",
      comment: "comment13",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }, {
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
      offenderNo: "A1234AB",
      firstName: "MICHAEL",
      lastName: "SMITH",
      cellLocation: "LEI-A-1-2",
      event: "CHAP",
      eventDescription: "Chapel",
      comment: "comment12",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  ];
}

function createAppointmentsResponse () {
  return [
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "GYM",
      eventDescription: "The gym",
      comment: "comment14",
      startTime: "2017-10-15T17:00:00",
      endTime: "2017-10-15T17:30:00"
    },
    {
      offenderNo: "A1234ZZ",
      firstName: "IRRELEVANT",
      lastName: "PERSON",
      cellLocation: "LEI-Z-1-1",
      event: "GYM",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  ];
}

function createVisitsResponse () {
  return [
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "VISIT",
      eventDescription: "Official",
      comment: "comment18",
      startTime: "2017-10-15T11:00:00",
      endTime: "2017-10-15T11:30:00"
    },
    {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: "LEI-A-1-3",
      event: "VISIT",
      eventDescription: "Family",
      comment: "comment19",
      startTime: "2017-10-15T11:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  ];
}
