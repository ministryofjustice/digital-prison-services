// Disabled temporarily while switching to PayOptions

import React from 'react'
import { shallow } from 'enzyme'

import PayOptions from '.'

// WIP as need to look into testing when using Hooks
describe('<PayOptions />', () => {
  let wrapper

  describe.skip('without all props', () => {
    it('should render without crashing', () => {
      wrapper = shallow(<PayOptions />)

      expect(wrapper).toHaveLength(1)
    })

    it('should not render a radio when missing an eventId', () => {
      wrapper = shallow(<PayOptions offenderNo="A123" />)

      expect(wrapper.find('Radio')).toHaveLength(0)
    })

    it('should not render a radio when missing an offenderNo', () => {
      wrapper = shallow(<PayOptions eventId={456} />)

      expect(wrapper.find('Radio')).toHaveLength(0)
    })
  })
})
