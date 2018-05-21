import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Error from "../Error";

Enzyme.configure({ adapter: new Adapter() });


describe('Error component', () => {
  it('should render error correctly', async () => {
    const component = shallow(<Error error="Hello!" clearMessage={jest.fn()}/>);
    expect(component.find('div').at(1).text()).toContain('Hello!');
  });
});
