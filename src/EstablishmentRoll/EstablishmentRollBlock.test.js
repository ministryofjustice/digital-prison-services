import React from 'react'
import { shallow } from 'enzyme'
import EstablishmentRollBlock from './EstablishmentRollBlock'

describe('<EstablishmentRollBlock />', () => {
  const props = {
    block: {
      name: 'Test Housing Block',
      numbers: [
        { name: 'Beds in use', value: 123 },
        { name: 'Currently in cell', value: 123 },
        { name: 'Currently out', value: 123 },
        { name: 'Operational cap.', value: 123 },
        { name: 'Net vacancies', value: 123 },
        { name: 'Out of order', value: 123 },
      ],
    },
  }
  const wrapper = shallow(<EstablishmentRollBlock {...props} />)

  it('should render without error', () => {
    expect(wrapper.find('.establishment-roll-block').exists()).toBe(true)
  })

  it('should render the name of the block', () => {
    expect(wrapper.find('h2').text()).toEqual(props.block.name)
  })

  it('should render the correct amount of block figures', () => {
    expect(wrapper.find('.block-figures__figure').length).toEqual(6)
  })

  describe('when highlight prop is true', () => {
    wrapper.setProps({ highlight: true })
    it('should apply the highlight class', () => {
      expect(wrapper.find('.establishment-roll-block').hasClass('establishment-roll-block--highlight')).toBe(true)
    })
  })

  describe('when isLastBlock prop is true', () => {
    wrapper.setProps({ isLastBlock: true })
    it('should apply the last class', () => {
      expect(wrapper.find('.establishment-roll-block').hasClass('establishment-roll-block--last')).toBe(true)
    })
  })
})
