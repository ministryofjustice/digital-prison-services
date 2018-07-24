Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const updateAttendance = require('../controllers/updateAttendance').updateAttendance;
const elite2Api = require('../elite2Api');

const res = {
  render: jest.fn(),
  redirect: jest.fn()
};

describe('Attendence / pay controller', async () => {
  it('should update activity', async () => {
    const req = {
      query: {
        offenderNo: 'ABC123',
        activityId: 45
      },
      body: {
        eventOutcome: 'EVENTOUTCOME',
        performance: 'PERFORMANCE',
        outcomeComment: 'my comment'
      }
    };

    elite2Api.updateAttendance = jest.fn();
    elite2Api.createCaseNote = jest.fn();
    //elite2Api.updateAttendance.mockImplementationOnce(() => {});

    await updateAttendance(req, res);

    expect(elite2Api.updateAttendance.mock.calls.length).toBe(1);
    expect(elite2Api.updateAttendance.mock.calls[0][0]).toBe(req);
    expect(elite2Api.createCaseNote).not.toHaveBeenCalled();
  });

  it('should create a case note for IEP', async () => {
    const req = {
      query: {
        offenderNo: 'ABC123',
        activityId: 45
      },
      body: {
        eventOutcome: 'UNACAB',
        performance: 'UNACCEPT',
        outcomeComment: 'my comment'
      }
    };

    // Fix current time to 2018-05-23
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1527076708000);

    elite2Api.updateAttendance = jest.fn();
    elite2Api.createCaseNote = jest.fn();

    await updateAttendance(req, res);

    expect(elite2Api.updateAttendance.mock.calls.length).toBe(1);
    expect(elite2Api.updateAttendance.mock.calls[0][0]).toBe(req);

    expect(elite2Api.createCaseNote.mock.calls.length).toBe(1);
    const body = elite2Api.createCaseNote.mock.calls[0][0].body;
    expect(body.type).toBe('Negative Behaviour');
    expect(body.subType).toBe('IEP Warning');
    expect(body.occurrenceDateTime).toBe('2018-05-23T12:58');
    expect(body.text).toBe('Refused to attend activity / education.');

    // Restore Time
    dateNowSpy.mockReset();
    dateNowSpy.mockRestore();
  });

  it('should throw an error for missing ids', async (done) => {
    const req = {
      query: {
        // intentionally missing
      },
      body: {
        eventOutcome: 'UNACAB',
        performance: 'UNACCEPT',
        outcomeComment: 'my comment'
      }
    };

    try {
      await updateAttendance(req, res);
      fail();
    } catch (e) {
      expect(e.message).toEqual('Offender or activity id missing');
      done();
    }
  });
});
