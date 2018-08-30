import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import moment from 'moment';
import { ResultsActivity } from "./ResultsActivity";

Enzyme.configure({ adapter: new Adapter() });

const PRISON = 'SYI';

const OFFENDER_NAME_COLUMN = 0;
const LOCATION_COLUMN = 1;
const NOMS_ID_COLUMN = 2;
const ACTIVITY_COLUMN = 3;
const OTHER_COLUMN = 4;
const ATTEND_COLUMN = 5;
const DONT_ATTEND_COLUMN = 6;

const response = [
  {
    offenderNo: "A1234AA",
    firstName: "ARTHUR",
    lastName: "ANDERSON",
    cellLocation: `${PRISON}-A-1-1`,
    event: "PA",
    eventDescription: "Prison Activities",
    comment: "Chapel",
    startTime: "2017-10-15T18:00:00",
    endTime: "2017-10-15T18:30:00",
    eventsElsewhere: [{
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: `${PRISON}-A-1-1`,
      event: "VISIT",
      eventDescription: "Visits",
      comment: "Official Visit",
      startTime: "2017-10-15T11:00:00",
      endTime: "2017-10-15T11:30:00"
    },
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: `${PRISON}-A-1-1`,
      comment: "Appt details",
      event: "MEDE",
      eventDescription: "Medical - Dentist",
      startTime: "2018-06-18T11:40:00"
    }]
  },
  {
    offenderNo: "A1234AB",
    firstName: "MICHAEL",
    lastName: "SMITH",
    cellLocation: `${PRISON}-A-1-2`,
    event: "VISIT",
    eventStatus: 'CANC',
    eventDescription: "Visits",
    comment: "Family Visit",
    startTime: "2017-10-15T18:00:00",
    endTime: "2017-10-15T18:30:00"
  },
  {
    offenderNo: "A1234AC",
    firstName: "FRED",
    lastName: "QUIMBY",
    cellLocation: `${PRISON}-A-1-3`,
    event: "PA",
    eventDescription: "Prison Activities",
    comment: "Chapel",
    startTime: "2017-10-15T18:00:00",
    endTime: "2017-10-15T18:30:00",
    eventsElsewhere: [
      {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "QUIMBY",
        cellLocation: `${PRISON}-A-1-3`,
        event: "VISIT",
        eventStatus: 'CANC',
        eventDescription: "Visits",
        comment: "Family Visit",
        startTime: "2017-10-15T11:11:00",
        endTime: "2017-10-15T18:30:00"
      }
    ]
  }
];

const user = {
  activeCaseLoadId: PRISON,
  caseLoadOptions: [
    { caseLoadId: 'XXX', description: 'Some Prison' },
    { caseLoadId: PRISON, description: 'Shrewsbury' }
  ]
};

const activities = [
  { locationId: 4, userDescription: "Some other activity" },
  { locationId: 5, userDescription: "Chapel Activity" }
];
const activity = "5";

describe('Offender results component Jira NN-843', () => {
  it('should render initial offender results form correctly', async () => {
    const aFewDaysAgo = moment().subtract(3, 'days');
    const date = aFewDaysAgo.format('DD/MM/YYYY');
    const longDateFormat = aFewDaysAgo.format('dddd Do MMMM');

    const component = shallow(<ResultsActivity
      history={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={response}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      date={date}
      period={'ED'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>
    );
    expect(component.find('.whereabouts-title').text()).toEqual('Chapel Activity');
    expect(component.find('.prison-title').text()).toEqual('Shrewsbury');
    expect(component.find('.whereabouts-date').text()).toEqual(longDateFormat + ' (ED)');

    // Dig into the DatePicker component
    const searchDate = component.find('[additionalClassName="dateInputResults"]').shallow().shallow().shallow().find('input');
    expect(searchDate.some(`[value='${date}']`)).toEqual(true);
    const periodSelect = component.find('#period-select');
    expect(periodSelect.some('[value="ED"]')).toEqual(true);

    const tr = component.find('tr');
    expect(tr.length).toEqual(4); // 3 plus table header tr
    expect(tr.at(1).find('td a').at(OFFENDER_NAME_COLUMN).text()).toEqual('Anderson, Arthur');
    expect(tr.at(1).find('td').at(NOMS_ID_COLUMN).text()).toEqual('A1234AA');
    expect(tr.at(1).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-1');
    expect(tr.at(1).find('td').at(ACTIVITY_COLUMN).text()).toEqual('Chapel');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Visits - Official Visit 11:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(1).text()).toEqual('Medical - Dentist - Appt details 11:40');
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
    // Check not disabled. This odd looking attribute value is handled correctly in the real DOM
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').debug()).toEqual(expect.stringContaining('disabled={true}')); //TODO should be false in V2 (currently disabled for V1)
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);

    expect(tr.at(2).find('td a').at(OFFENDER_NAME_COLUMN).text()).toEqual('Smith, Michael');
    expect(tr.at(2).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-2');
    expect(tr.at(2).find('td').at(ACTIVITY_COLUMN).text()).toEqual('Visits - Family Visit (cancelled)');
    expect(tr.at(2).find('td').at(OTHER_COLUMN).find('li').length).toEqual(0);

    expect(tr.at(3).find('td a').at(OFFENDER_NAME_COLUMN).text()).toEqual('Quimby, Fred');
    expect(tr.at(3).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-3');
    expect(tr.at(3).find('td').at(ACTIVITY_COLUMN).text()).toEqual('Chapel');
    expect(tr.at(3).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Visits - Family Visit 11:11 (cancelled)');
  });

  it('should render empty results list correctly', async () => {
    const component = shallow(<ResultsActivity
      history={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={[]}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      period={'PM'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);
    const tr = component.find('tr');
    expect(tr.length).toEqual(1); // table header tr only
    expect(component.find('div.font-small').text()).toEqual('No prisoners found');
  });

  it('should handle buttons correctly', async () => {
    const handleSearch = jest.fn();

    const handlePrint = jest.fn();
    const today = moment().format('DD/MM/YYYY');
    const component = shallow(<ResultsActivity
      history ={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      date={today}
      period={'AM'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    expect(component.find('#buttons > button').some('#printButton')).toEqual(true);

    component.find('#updateButton').simulate('click');
    expect(handleSearch).toHaveBeenCalled();
    expect(handlePrint).not.toHaveBeenCalled();
    expect(handlePrint).not.toHaveBeenCalled();
    component.find('#printButton').at(0).simulate('click');
    expect(handlePrint).toHaveBeenCalled();
  });

  it('should recognise "Today"', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const today = 'Today';
    const component = shallow(<ResultsActivity
      history={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      date={today}
      period={'AM'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);
    // If today, print button is present
    expect(component.find('#buttons > button').some('#printButton')).toEqual(true);
  });

  it('should not display print button when date is not today', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '25/05/2018';
    const component = shallow(<ResultsActivity
      history ={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      date={oldDate}
      period={'ED'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    expect(component.find('#buttons > button').some('#printButton')).toEqual(false);
  });

  it('checkboxes should be read-only when date is over a week ago', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '23/05/2018';
    const component = shallow(<ResultsActivity
      history ={{ push: jest.fn() }}
      activities={activities}
      activity={activity}
      activityData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getActivityList={jest.fn()}
      date={oldDate}
      period={'ED'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    const tr = component.find('tr');
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
  });
});
