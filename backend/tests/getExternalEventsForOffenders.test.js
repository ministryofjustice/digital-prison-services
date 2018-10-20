const moment = require('moment');
const elite2ApiFactory = require('../api/elite2Api').elite2ApiFactory;

const elite2Api = elite2ApiFactory(null);
const externalEvents = require('../shared/getExternalEventsForOffenders');
const { switchDateFormat } = require('../utils');


describe('External events', () => {
  const offenderWithData = 'A1234AA';
  const offenderWithNoData = 'ABCDEEE';

  beforeEach(() => {
    elite2Api.getSentenceData = jest.fn();
    elite2Api.getCourtEvents = jest.fn();
    elite2Api.getExternalTransfers = jest.fn();
  });


  it('should handle empty offender numbers', async () => {
    const context = {};
    const response = await await externalEvents(elite2Api, context, {});
    expect(response).toEqual([]);
  });

  it('should deal with empty responses', async () => {
    const today = moment();

    elite2Api.getSentenceData.mockImplementationOnce(() => null);
    elite2Api.getCourtEvents.mockImplementationOnce(() => []);
    elite2Api.getExternalTransfers.mockImplementationOnce(() => undefined);

    const response = await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(response.get(offenderWithData).releaseScheduled).toBe(false);
    expect(response.get(offenderWithData).courtEvents.length).toBe(0);
    expect(response.get(offenderWithData).scheduledTransfers.length).toBe(0);

    expect(elite2Api.getCourtEvents.mock.calls.length).toBe(1);
    expect(elite2Api.getExternalTransfers.mock.calls.length).toBe(1);
    expect(elite2Api.getSentenceData.mock.calls.length).toBe(1);
  });

  it('should call getSentenceData with the correct parameters', async () => {
    const today = moment();
    await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(elite2Api.getSentenceData).toHaveBeenCalledWith({}, [offenderWithData, offenderWithNoData]);
  });

  it('should call getCourtEvents with the correct parameters', async () => {
    const today = moment();
    await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(elite2Api.getCourtEvents).toHaveBeenCalledWith({},
      {
        agencyId: 'LEI',
        date: switchDateFormat(today),
        offenderNumbers: [offenderWithData, offenderWithNoData]
      });
  });

  it('should call getExternalTransfers with the correct parameters', async () => {
    const today = moment();
    await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(elite2Api.getExternalTransfers).toHaveBeenCalledWith({},
      {
        agencyId: 'LEI',
        date: switchDateFormat(today),
        offenderNumbers: [offenderWithData, offenderWithNoData]
      });
  });

  it('should extend the offender data with released, court flags and transfers', async () => {
    const today = moment();

    elite2Api.getSentenceData.mockImplementationOnce(() => createSentenceDataResponse());
    elite2Api.getCourtEvents.mockImplementationOnce(createCourtEventResponse);
    elite2Api.getExternalTransfers.mockImplementationOnce(createTransfersResponse);

    const response = await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(response.get(offenderWithData).releaseScheduled).toBe(true);
    expect(response.get(offenderWithData).courtEvents.length).toBe(1);
    expect(response.get(offenderWithData).scheduledTransfers.length).toBe(1);

    expect(response.get(offenderWithNoData).releaseScheduled).toBe(false);
    expect(response.get(offenderWithNoData).courtEvents.length).toBe(0);
    expect(response.get(offenderWithNoData).scheduledTransfers.length).toBe(0);

    expect(elite2Api.getCourtEvents.mock.calls.length).toBe(1);
    expect(elite2Api.getExternalTransfers.mock.calls.length).toBe(1);
    expect(elite2Api.getSentenceData.mock.calls.length).toBe(1);
  });

  it('should return multiple scheduled transfers along with status descriptions', async () => {
    const today = moment();

    elite2Api.getExternalTransfers.mockImplementationOnce(() => createAllTransferTypes());

    const response = await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData, offenderWithNoData], formattedDate: switchDateFormat(today) });

    expect(response.get(offenderWithData).scheduledTransfers).toEqual([
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

  it('should show the latest completed court event when there are more than one', async () => {
    const today = moment();

    elite2Api.getCourtEvents.mockImplementationOnce(() => [
      {
        eventId: 1,
        eventStatus: "COMP",
        eventType: "COURT",
        offenderNo: offenderWithData,
        startTime: "2018-09-05T17:00:00"
      },
      {
        eventId: 2,
        eventStatus: "COMP",
        eventType: "COURT",
        offenderNo: offenderWithData,
        startTime: "2018-09-05T15:00:00"
      },
      {
        eventId: 3,
        eventStatus: "SCH",
        eventType: "COURT",
        offenderNo: offenderWithData,
        startTime: "2018-09-05T17:00:00"
      },
      {
        eventId: 4,
        eventStatus: "EXP",
        eventType: "COURT",
        offenderNo: offenderWithData,
        startTime: "2018-09-05T15:00:00"
      }
    ]);

    const response = await externalEvents(elite2Api, {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData], formattedDate: switchDateFormat(today) });

    expect(response.get(offenderWithData).courtEvents).toEqual([
      { eventDescription: "Court visit scheduled", eventId: 3, scheduled: true },
      { eventDescription: "Court visit scheduled", eventId: 4, expired: true },
      { eventDescription: "Court visit scheduled", eventId: 1, complete: true }
    ]);
  });
});

function createSentenceDataResponse () {
  return [
    {
      offenderNo: 'A1234AA',
      sentenceDetail: {
        releaseDate: switchDateFormat(moment())
      }
    }
  ];
}
function createCourtEventResponse () {
  return [{
    event: "19",
    eventDescription: "Court Appearance - Police Product Order",
    eventId: 349360018,
    eventStatus: "SCH",
    eventType: "COURT",
    firstName: "BYSJANHKUMAR",
    lastName: "HENRINEE",
    offenderNo: "A1234AA",
    startTime: "2018-09-05T15:00:00"
  }];
}

function createTransfersResponse () {
  return [{
    firstName: "BYSJANHKUMAR",
    lastName: "HENRINEE",
    offenderNo: "A1234AA",
    startTime: switchDateFormat(moment())
  }];
}

function createAllTransferTypes () {
  return [
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
  ];
}
