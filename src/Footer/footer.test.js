import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Footer from "./index";

Enzyme.configure({ adapter: new Adapter() });

describe('Footer', () => {
  it('should close the menu when the footer is clicked', () => {
    const setMenuOpen = jest.fn();
    const component = shallow(<Footer showTermsAndConditions={jest.fn()} setMenuOpen={setMenuOpen}/>);

    component.find('.FooterContainer').simulate('click');

    expect(setMenuOpen).toHaveBeenCalledWith(false);
  });
});
