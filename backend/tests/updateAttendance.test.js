Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY');
const momentTimeZone = require('moment-timezone');
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

    const zone = 'Europe/London';
    const now = momentTimeZone.tz(zone);
    const dateString = now.format('YYYY-MM-DDThh:mm');
    const unix = now.unix();
    // Fix current time to this version of 'now'
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => unix * 1000);

    elite2Api.updateAttendance = jest.fn();
    elite2Api.createCaseNote = jest.fn();

    await updateAttendance(req, res);

    expect(elite2Api.updateAttendance.mock.calls.length).toBe(1);
    expect(elite2Api.updateAttendance.mock.calls[0][0]).toBe(req);

    expect(elite2Api.createCaseNote.mock.calls.length).toBe(1);
    const data = elite2Api.createCaseNote.mock.calls[0][0].data;
    expect(data.type).toBe('Negative Behaviour');
    expect(data.subType).toBe('IEP Warning');
    expect(data.occurrenceDateTime).toBe(dateString);
    expect(data.text).toBe('Refused to attend activity / education.');

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

  it('Server error should be handled correctly', async (done) => {
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
    const error = new Error('Request failed with status code 400');
    error.response = {
      data: {
        userMessage: 'Here is the actual error text',
        status: 400
      },
      status: 400,
      message: 'Server error'
    };
    elite2Api.updateAttendance.mockRejectedValue(error);

    try {
      await updateAttendance(req, res);
      fail();
    } catch (e) {
      expect(e).toEqual(error);
      done();
    }
  });
});
