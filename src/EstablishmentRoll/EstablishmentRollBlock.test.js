import React from 'react'
import { shallow } from 'enzyme'
import pathToRegexp from 'path-to-regexp'
import { EstablishmentRollBlock } from './EstablishmentRollBlock'
import routePaths from '../routePaths'

describe('<EstablishmentRollBlock />', () => {
  const props = {
    block: {
      name: 'Test Housing Block',
      livingUnitId: 123456789,
      numbers: [
        { name: 'Beds in use', value: 123 },
        { name: 'In today', value: 123 },
        { name: 'Out today', value: 123 },
        { name: 'Operational cap.', value: 123 },
        { name: 'Net vacancies', value: 123 },
        { name: 'Out of order', value: 123 },
        { name: 'Currently out', value: 1 },
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
    expect(wrapper.find('.block-figures__figure').length).toEqual(7)
  })

  it('should render a <Link/> for the "In today" statistic', () => {
    const statistic = wrapper.find('.block-figure').filterWhere(ww =>
      ww
        .find('label')
        .filterWhere(w => w.text() === 'In today')
        .exists()
    )
    const link = statistic.find('Link')
    expect(link.exists()).toEqual(true)
    expect(link.props().to).toEqual(routePaths.inToday)
  })

  it('should render a <Link/> for the "Out today" statistic', () => {
    const statistic = wrapper.find('.block-figure').filterWhere(ww =>
      ww
        .find('label')
        .filterWhere(w => w.text() === 'Out today')
        .exists()
    )
    const link = statistic.find('Link')
    expect(link.exists()).toEqual(true)
    expect(link.props().to).toEqual(routePaths.outToday)
  })

  it('should render a <Link/> for the "Currently out" statistic', () => {
    const statistic = wrapper.find('.block-figure').filterWhere(ww =>
      ww
        .find('label')
        .filterWhere(w => w.text() === 'Currently out')
        .exists()
    )
    const link = statistic.find('Link')
    expect(link.exists()).toEqual(true)
    const expectedPath = pathToRegexp.compile(routePaths.currentlyOut)({ livingUnitId: 123456789 })
    expect(link.props().to).toEqual(expectedPath)
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
