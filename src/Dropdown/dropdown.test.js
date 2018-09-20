import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Dropdown from "../Dropdown";

Enzyme.configure({ adapter: new Adapter() });

const user = {
  activeCaseLoadId: "LEI",
  caseLoadOptions: [
    { caseLoadId: "LEI", description: "LEEDS (HMP)", type: "INST", caseloadFunction: "GENERAL" },
    { caseLoadId: "SYI", description: "Shrewsbury (HMP)", type: "INST", caseloadFunction: "GENERAL" }
  ]
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
      setMenuOpen={jest.fn()}
      menuOpen
      history={{ push: jest.fn() }}/>
    );
    component.find('#info-wrapper').at(0).simulate('click');
    const dropdown = component.find('a.dropdown-menu-option');
    // Current id 'LEI' should be omitted
    expect(dropdown.length).toEqual(1);
    expect(dropdown.get(0).props.children).toEqual('Shrewsbury (HMP)');
  });

  it('should handle empty caseLoadOptions elegantly', async () => {
    const component = shallow(<Dropdown
      switchCaseLoad ={jest.fn()}
      user={userWithoutCaseLoadOptions}
      setMenuOpen={jest.fn()}
      menuOpen
      history={{ push: jest.fn() }}/>
    );
    component.find('#info-wrapper').at(0).simulate('click');
    expect(component.find('a.dropdown-menu-option')).toHaveLength(0);
    expect(component.find('a.dropdown-menu-link').get(0).props.children).toEqual('Log out');
  });

  it('should not be visible', () => {
    const component = shallow(<Dropdown
      switchCaseLoad ={jest.fn()}
      user={user}
      setMenuOpen={jest.fn()}
      history={{ push: jest.fn() }}/>
    );
    expect(component.find('a.dropdown-menu-option').length).toBe(0);
  });

  it('should open the menu on click', () => {
    const setMenuOpen = jest.fn();

    const component = shallow(<Dropdown
      switchCaseLoad ={jest.fn()}
      user={user}
      setMenuOpen={setMenuOpen}
      history={{ push: jest.fn() }}
    />);

    component.find('#info-wrapper').at(0).simulate('click');

    expect(setMenuOpen).toHaveBeenCalledWith(true);
  });
});
