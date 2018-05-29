import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { ResultsHouseblock } from "./ResultsHouseblock";

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
      eventDescription: "Chapel",
      comment: "comment11",
      startTime: "2017-10-15T18:00:00",
      endTime: "2017-10-15T18:30:00"
    },
    others: [{
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
    }]
  },
  {
    activity: {
      offenderNo: "A1234AB",
      firstName: "MICHAEL",
      lastName: "SMITH",
      cellLocation: "LEI-A-1-2",
      event: "CHAP",
      eventDescription: "Chapel Act",
      comment: "comment12",
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
      eventDescription: "Chapel Activity",
      comment: "comment13",
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
        eventDescription: "Family Visit",
        comment: "comment19",
        startTime: "2017-10-15T11:00:00",
        endTime: "2017-10-15T18:30:00"
      }
    ] }
];

const locations = ['AWing', 'BWing'];

describe('Offender results component', () => {
  it('should render initial offender results form correctly', async () => {
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      date={'27/02/2018'}
      period={'ED'}
      currentLocation={'BWing'}/>
    );
    const tr = component.find('tr');
    expect(tr.length).toEqual(4); // 3 plus table header tr
    expect(tr.at(1).find('td').at(OFFENDER_NAME_COLUMN).text()).toEqual('Anderson, Arthur');
    expect(tr.at(1).find('td').at(NOMS_ID_COLUMN).text()).toEqual('A1234AA');
    expect(tr.at(1).find('td').at(LOCATION_COLUMN).text()).toEqual('LEI-A-1-1');
    expect(tr.at(1).find('td').at(MAIN_COLUMN).text()).toEqual('Chapel');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Official Visit - 11:00');
    expect(tr.at(1).find('td').at(OTHER_COLUMN).find('li').at(1).text()).toEqual('The gym, appointment - 17:00');
    expect(tr.at(1).find('td').at(UNLOCK_COLUMN).find('input').some('[type="checkbox"]')).toEqual(true);
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
    expect(tr.at(3).find('td').at(OTHER_COLUMN).find('li').at(0).text()).toEqual('Family Visit - 11:00');
  });

  it('should handle save button correctly', async () => {
    const handleSearch = jest.fn();
    const component = shallow(<ResultsHouseblock
      history ={{ push: jest.fn() }}
      locations={locations}
      houseblockData={response}
      handleSearch={handleSearch}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      date={'27/02/2018'}
      period={'ED'}
      currentLocation={'BWing'}/>);

    component.find('#saveButton').simulate('click');
    expect(handleSearch).toHaveBeenCalled();
  });
});
