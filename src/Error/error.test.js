import React from 'react';
import { shallow } from 'enzyme';
import Error from "../Error";

describe('Error component', () => {
  it('should render error correctly', async () => {
    const component = shallow(<Error error="Hello!" clearMessage={jest.fn()}/>);
    expect(component.find('div').at(1).text()).toContain('Hello!');
  });
});
