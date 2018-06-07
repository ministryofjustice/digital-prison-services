import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Dropdown from "../Dropdown";

Enzyme.configure({ adapter: new Adapter() });

const user = {
  activeCaseLoadId: "LEI",
  caseLoadOptions: [{ caseLoadId: "LEI", description: "LEEDS (HMP)", type: "INST", caseloadFunction: "GENERAL" }]
};

const userWithoutCaseLoadOptions = {
  activeCaseLoadId: "LEI",
  caseLoadOptions: []
};

describe('Dropdown component', () => {
  it('should render dropdown correctly', async () => {
    const component = shallow(<Dropdown
      switchCaseLoad ={jest.fn()}
      user={user}
      history={{ push: jest.fn() }}/>
    );
    component.find('#info-wrapper').at(0).simulate('click');
    expect(component.find('a.dropdown-menu-option').get(0).props.children).toEqual('LEEDS (HMP)');
  });

  it('should handle empty caseLoadOptions elegantly', async () => {
    const component = shallow(<Dropdown
      switchCaseLoad ={jest.fn()}
      user={userWithoutCaseLoadOptions}
      history={{ push: jest.fn() }}/>
    );
    component.find('#info-wrapper').at(0).simulate('click');
    expect(component.find('a.dropdown-menu-option')).toHaveLength(0);
    expect(component.find('a.dropdown-menu-link').get(0).props.children).toEqual('Log out');
  });
});
