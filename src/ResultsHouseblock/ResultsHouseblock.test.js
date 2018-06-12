import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { ResultsHouseblock } from "./ResultsHouseblock";
import moment from 'moment';

Enzyme.configure({ adapter: new Adapter() });

const OFFENDER_NAME_COLUMN = 0;
const LOCATION_COLUMN = 1;
const NOMS_ID_COLUMN = 2;
const MAIN_COLUMN = 3;
const OTHER_COLUMN = 4;
const UNLOCK_COLUMN = 5;
const GONE_COLUMN = 6;
//const RECIEVED_COLUMN = 7;
const ATTEND_COLUMN = 8;
const DONT_ATTEND_COLUMN = 9;

const response = [
  {
    activity: {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "CHAP",
      comment: "Chapel",
      eventDescription: "comment11",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    others: [{
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "VISIT",
      comment: "Official Visit",
      eventDescription: "comment18",
      startTime: "2017-10-15T11:00:00",
      endTime: "2017-10-15T11:30:00"
    },
    {
      offenderNo: "A1234AA",
      firstName: "ARTHUR",
      lastName: "ANDERSON",
      cellLocation: "LEI-A-1-1",
      event: "GYM",
      comment: "The gym, appointment",
      eventDescription: "comment14",
      startTime: "2017-10-15T17:00:00",
      endTime: "2017-10-15T17:30:00"
    }]
  },
  {
    activity: {
      offenderNo: "A1234AB",
      firstName: "MICHAEL",
      lastName: "SMITH",
      cellLocation: "LEI-A-1-2",
      event: "CHAP",
      comment: "Chapel Act",
      eventDescription: "comment12",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    }
  },
  {
    activity: {
      offenderNo: "A1234AC",
      firstName: "FRED",
      lastName: "QUIMBY",
      cellLocation: "LEI-A-1-3",
      event: "CHAP",
      comment: "Chapel Activity",
      eventDescription: "comment13",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    others: [
      {
        offenderNo: "A1234AC",
        firstName: "FRED",
        lastName: "QUIMBY",
        cellLocation: "LEI-A-1-3",
        event: "VISIT",
        comment: "Family Visit",
        eventDescription: "comment19",
        startTime: "2017-10-15T11:00:00",
        endTime: "2017-10-15T18:30:00"
      }
    ] }
];

const locations = ['AWing', 'BWing'];

describe('Offender results component Jira NN-843', () => {
  it('should render initial offender results form correctly', async () => {
    const today = moment().format('DD/MM/YYYY');
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={jest.fn()}
      handleSave={jest.fn()}
      handlePrint={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      getHouseblockList={jest.fn()}
      date={today}
      period={'ED'}
      currentLocation={'BWing'}/>
    );
    const housingLocationSelect = component.find('#housing-location-select');
    expect(housingLocationSelect.some('[value="BWing"]')).toEqual(true);
    // Dig into the DatePicker component
    const searchDate = component.find('[additionalClassName="dateInputResults"]').shallow().shallow().shallow().find('input');
    expect(searchDate.some(`[value='${today}']`)).toEqual(true);
    const periodSelect = component.find('#period-select');
    expect(periodSelect.some('[value="ED"]')).toEqual(true);

    const tr = component.find('tr');
    expect(tr.length).toEqual(4); // 3 plus table header tr
    expect(tr.at(1).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Anderson, Arthur');
    expect(tr.at(1).find('td').at(NOMS_ID_COLUMN).text()).toEqual('A1234AA');
    expect(tr.at(1).find('td').at(LOCATION_COLUMN).text()).toEqual('LEI-A-1-1');
    expect(tr.at(1).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Official Visit 11:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(1).text()).toEqual('The gym, appointment 17:00');
    expect(tr.at(1).find('td').at(UNLOCK_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
    // Check not disabled. This odd looking attribute value is handled correctly in the real DOM
    expect(tr.at(1).find('td').at(UNLOCK_COLUMN).find('input').debug()).toEqual(expect.stringContaining('disabled={false}'));
    expect(tr.at(1).find('td').at(GONE_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
    // expect(tr.at(1).find('td').at(RECIEVED_COLUMN)...
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);

    expect(tr.at(2).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Smith, Michael');
    expect(tr.at(2).find('td').at(LOCATION_COLUMN).text()).toEqual('LEI-A-1-2');
    expect(tr.at(2).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel Act');
    expect(tr.at(2).find('td').at(OTHER_COLUMN).find('li').length).toEqual(0);

    expect(tr.at(3).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Quimby, Fred');
    expect(tr.at(3).find('td').at(LOCATION_COLUMN).text()).toEqual('LEI-A-1-3');
    expect(tr.at(3).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel Activity');
    expect(tr.at(3).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Family Visit 11:00');
  });

  it('should handle buttons correctly', async () => {
    const handleSearch = jest.fn();
    const handleSave = jest.fn();
    const handlePrint = jest.fn();
    const today = moment().format('DD/MM/YYYY');
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handleSave={handleSave}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      getHouseblockList={jest.fn()}
      date={today}
      period={'ED'}
      currentLocation={'BWing'}/>);

    expect(component.find('#buttons > button').some('#printButton')).toEqual(true);

    component.find('#updateButton').simulate('click');
    expect(handleSearch).toHaveBeenCalled();
    expect(handleSave).not.toHaveBeenCalled();
    expect(handlePrint).not.toHaveBeenCalled();
    component.find('#saveButton').at(0).simulate('click');
    expect(handleSave).toHaveBeenCalled();
    expect(handlePrint).not.toHaveBeenCalled();
    component.find('#printButton').at(0).simulate('click');
    expect(handlePrint).toHaveBeenCalled();
  });

  it('should not display print button when date is not today', async () => {
    const handleSearch = jest.fn();
    const handleSave = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '25/05/2018';
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handleSave={handleSave}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      getHouseblockList={jest.fn()}
      date={oldDate}
      period={'ED'}
      currentLocation={'BWing'}/>);

    expect(component.find('#buttons > button').some('#printButton')).toEqual(false);
  });

  it('checkboxes should be read-only when date is over a week ago', async () => {
    const handleSearch = jest.fn();
    const handleSave = jest.fn();
    const handlePrint = jest.fn();
    const oldDate = '23/05/2018';
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handleSave={handleSave}
      handlePrint={handlePrint}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      getHouseblockList={jest.fn()}
      date={oldDate}
      period={'ED'}
      currentLocation={'BWing'}/>);

    const tr = component.find('tr');
    expect(tr.at(1).find('td').at(UNLOCK_COLUMN).find('input').some('[disabled]')).toEqual(true);
    expect(tr.at(1).find('td').at(GONE_COLUMN).find('input').some('[disabled]')).toEqual(true);
    expect(tr.at(1).find('td').at(ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
    expect(tr.at(1).find('td').at(DONT_ATTEND_COLUMN).find('input').some('[disabled]')).toEqual(true);
  });
});
