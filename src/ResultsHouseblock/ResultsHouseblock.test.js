import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { ResultsHouseblock } from "./ResultsHouseblock";
import moment from 'moment';

Enzyme.configure({ adapter: new Adapter() });

const PRISON = 'LEI';

const OFFENDER_NAME_COLUMN = 0;
const LOCATION_COLUMN = 1;
const NOMS_ID_COLUMN = 2;
const MAIN_COLUMN = 3;
const OTHER_COLUMN = 4;
const ATTEND_COLUMN = 5;
const DONT_ATTEND_COLUMN = 6;

const response = [
  {
    activity: {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: `${PRISON}-A-1-1`,
      event: "PA",
      eventId: 56,
      eventType: "PRISON_ACT",
      eventDescription: "Prison Activities",
      comment: "Chapel",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    others: [{
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
      event: "APP",
      eventDescription: "The gym, appointment",
      comment: "",
      startTime: "2017-10-15T17:00:00",
      endTime: "2017-10-15T17:30:00"
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
    activity: {
      offenderNo: "A1234AB",
      firstName: "MICHAEL",
      lastName: "SMITH",
      cellLocation: `${PRISON}-A-1-2`,
      event: "PA",
      eventType: "PRISON_ACT",
      eventDescription: "Prison Activities",
      comment: "Chapel Act",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  },
  {
    activity: {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: `${PRISON}-A-1-3`,
      event: "PA",
      eventType: "PRISON_ACT",
      eventDescription: "Prison Activities",
      comment: "Chapel Activity",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    others: [
      {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "QUIMBY",
        cellLocation: `${PRISON}-A-1-3`,
        event: "VISIT",
        eventDescription: "Visits",
        comment: "Family Visit",
        startTime: "2017-10-15T11:11:00",
        endTime: "2017-10-15T18:30:00"
      }
    ] }
];

const locations = ['AWing', 'BWing'];

const user = { activeCaseLoadId: 'SYI', caseLoadOptions: [{ caseLoadId: 'XXX', description: 'Some Prison' }, { caseLoadId: 'SYI', description: 'Shrewsbury' }] };

describe('Offender results component Jira NN-843', () => {
  it('should render initial offender results form correctly', async () => {
    const aFewDaysAgo = moment().subtract(3, 'days');
    const date = aFewDaysAgo.format('DD/MM/YYYY');
    const longDateFormat = aFewDaysAgo.format('dddd Do MMMM');

    const component = shallow(<ResultsHouseblock
      history={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={date}
      period={'ED'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>
    );
    expect(component.find('.whereabouts-title').text()).toEqual('BWing');
    expect(component.find('.prison-title').text()).toEqual('Shrewsbury');
    expect(component.find('.whereabouts-date').text()).toEqual(longDateFormat + ' (ED) '); //'Tuesday 12th June'

    const housingLocationSelect = component.find('#housing-location-select');
    expect(housingLocationSelect.some('[value="BWing"]')).toEqual(true);
    // Dig into the DatePicker component
    const searchDate = component.find('[additionalClassName="dateInputResults"]').shallow().shallow().shallow().find('input');
    expect(searchDate.some(`[value='${date}']`)).toEqual(true);
    const periodSelect = component.find('#period-select');
    expect(periodSelect.some('[value="ED"]')).toEqual(true);

    const tr = component.find('tr');
    expect(tr.length).toEqual(4); // 3 plus table header tr
    expect(tr.at(1).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Anderson, Arthur');
    expect(tr.at(1).find('td').at(NOMS_ID_COLUMN).text()).toEqual('A1234AA');
    expect(tr.at(1).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-1');
    expect(tr.at(1).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel 18:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Visits - Official Visit 11:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(1).text()).toEqual('The gym, appointment 17:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(2).text()).toEqual('Medical - Dentist - Appt details 11:40');
    // Check not disabled. This odd looking attribute value is handled correctly in the real DOM
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);

    expect(tr.at(2).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Smith, Michael');
    expect(tr.at(2).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-2');
    expect(tr.at(2).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel Act 18:00');
    expect(tr.at(2).find('td').at(OTHER_COLUMN).find('li').length).toEqual(0);

    expect(tr.at(3).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Quimby, Fred');
    expect(tr.at(3).find('td').at(LOCATION_COLUMN).text()).toEqual('A-1-3');
    expect(tr.at(3).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel Activity 18:00');
    expect(tr.at(3).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Visits - Family Visit 11:11');
  });

  it('should render empty results list correctly', async () => {
    const component = shallow(<ResultsHouseblock
      history={{ push: jest.fn() }}
      locations={locations}
      houseblockData={[]}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      period={'AM'}
      currentLocation={'BWing'}
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
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={today}
      period={'PM'}
      currentLocation={'BWing'}
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

  it('should not display print button when date is not today', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '25/05/2018';
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={oldDate}
      period={'ED'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    expect(component.find('#buttons > button').some('#printButton')).toEqual(false);
  });

  it('checkboxes should be read-only when date is over a week ago', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '23/05/2018';
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={oldDate}
      period={'ED'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    const tr = component.find('tr');
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
  });

  it('should display the correct sorting headings for Location', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const today = moment().format('DD/MM/YYYY');
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={today}
      period={'ED'}
      orderField={'cellLocation'}
      sortOrder={'ASC'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    expect(component.find('#Location-sort-asc').length).toEqual(1);
    expect(component.find('#Location-sort-desc').length).toEqual(0);
    expect(component.find('#Name-sort-desc').length).toEqual(0);
    expect(component.find('#Name-sort-asc').length).toEqual(0);
  });

  it('should display the correct sorting headings for Name', async () => {
    const handleSearch = jest.fn();
    const handlePrint = jest.fn();
    const today = moment().format('DD/MM/YYYY');
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      date={today}
      period={'ED'}
      orderField={'lastName'}
      sortOrder={'DESC'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    expect(component.find('#Location-sort-asc').length).toEqual(0);
    expect(component.find('#Location-sort-desc').length).toEqual(0);
    expect(component.find('#Name-sort-desc').length).toEqual(1);
    expect(component.find('#Name-sort-asc').length).toEqual(0);
  });

  it('should handle change of sort order', async () => {
    const handleSearch = jest.fn();
    const getHouseblockList = jest.fn();
    const handlePrint = jest.fn();
    const today = moment().format('DD/MM/YYYY');

    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={getHouseblockList}
      date={today}
      period={'ED'}
      orderField={'cellLocation'}
      sortOrder={'ASC'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);

    component.find('#Location-sort-asc').simulate('click');
    expect(getHouseblockList).toHaveBeenCalledWith('cellLocation', 'DESC');

    component.find('#Name-sortable-column').simulate('click');
    expect(getHouseblockList).toHaveBeenCalledWith('lastName', 'ASC');
  });

  it('should render back link', async () => {
    const component = shallow(<ResultsHouseblock
      history={{ push: jest.fn() }}
      locations={locations}
      houseblockData={[]}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      period={'AM'}
      currentLocation={'BWing'}
      agencyId={PRISON}
      showPaymentReasonModal={jest.fn()}
      user={user}/>);
    expect(component.find('#back_to_selection_link').length).toEqual(1);
  });
  //TODO Skipped for Part 1
  it.skip('should call showPaymentReasonModal with event and offender information', () => {
    const showPaymentReasonModal = jest.fn();

    const component = shallow(<ResultsHouseblock
      user={{}}
      houseblockData={[response[0]]}
      handleSearch={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      handlePay={jest.fn()}
      getHouseblockList={jest.fn()}
      showPaymentReasonModal={showPaymentReasonModal}
    />);

    const browserEvent = {
      target: {
        value: 'dummy'
      }
    };
    component.find('#col4_0').last().simulate('change',
      browserEvent
    );

    expect(showPaymentReasonModal).toHaveBeenCalledWith(response[0].activity[0], browserEvent);
  });
});
