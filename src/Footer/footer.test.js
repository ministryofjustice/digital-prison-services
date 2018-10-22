import React from 'react'
import { shallow } from 'enzyme'
import Footer from './index'

describe('Footer', () => {
  it('should close the menu when the footer is clicked', () => {
    const setMenuOpen = jest.fn()
    const component = shallow(<Footer showTermsAndConditions={jest.fn()} setMenuOpen={setMenuOpen} />)

    component.find('.FooterContainer').simulate('click')

    expect(setMenuOpen).toHaveBeenCalledWith(false)
  })
})
