import React from 'react'
import { shallow } from 'enzyme'
import { Page } from './Page'

describe('<Page />', () => {
  const props = {
    title: 'Page title',
    error: '',
    loaded: false,
    children: 'Page content',
  }

  describe('when the page is loading', () => {
    const wrapper = shallow(<Page {...props} />)
    it('should display the loading <Spinner /> component', () => {
      expect(wrapper.find('Spinner').exists()).toBe(true)
    })
  })

  describe('when the page has loaded', () => {
    const wrapper = shallow(<Page {...props} loaded />)
    it('should display the children prop', () => {
      expect(wrapper.find('.page-content').contains(props.children)).toEqual(true)
    })
  })

  describe('when there is an error', () => {
    const error = 'Error message'
    const wrapper = shallow(<Page {...props} loaded error={error} />)
    it('should an error message', () => {
      expect(wrapper.find('Error').exists()).toBe(true)
      expect(wrapper.find('Error').prop('error')).toEqual(error)
    })
  })
})
