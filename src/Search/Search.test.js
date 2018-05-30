import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Search } from "./Search";

Enzyme.configure({ adapter: new Adapter() });

const locations = ['AWing', 'BWing'];

describe('Search component', () => {
  it('should render initial search page correctly', async () => {
    const component = shallow(<Search
      history ={{ push: jest.fn() }}
      locations={locations}
      handleSearch={jest.fn()}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}/>
    );
    expect(component.find('#housing-location-select option').get(0).props.value).toEqual('AWing');
    expect(component.find('#housing-location-select option').get(1).props.value).toEqual('BWing');
  });

  it('should handle search button correctly', async () => {
    const handleSearch = jest.fn();
    const component = shallow(<Search
      history ={{ push: jest.fn() }}
      locations={locations}
      handleSearch={handleSearch}
      handleLocationChange={jest.fn()}
      handlePeriodChange={jest.fn()}
      handleDateChange={jest.fn()}
      date={'27/02/2018'}
      period={'ED'}
      currentLocation={'BWing'}/>);

    component.find('#continue-button').simulate('click');
    expect(handleSearch).toHaveBeenCalled();
  });
});
