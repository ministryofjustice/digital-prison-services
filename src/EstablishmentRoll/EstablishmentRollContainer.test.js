import React from 'react'
import { shallow } from 'enzyme'
import { EstablishmentRollContainer } from './EstablishmentRollContainer'
import { movements, blocks, totals } from './establishmentRollDummyData'

describe('<EstablishmentRollContainer />', () => {
  const props = {
    movements,
    blocks,
    totals,
    agencyId: 'LEI',
    establishmentRollBlockDataDispatch: jest.fn(),
    handleError: jest.fn(),
    setLoadedDispatch: jest.fn(),
    resetErrorDispatch: jest.fn(),
    establishmentRollDataDispatch: jest.fn(),
    titleDispatch: jest.fn(),
  }

  const wrapper = shallow(<EstablishmentRollContainer {...props} />)

  describe('when loaded', () => {
    it('should render without error', () => {
      expect(wrapper.find('.establishment-roll-container').exists()).toBe(true)
    })

    it('should have the correct page title', () => {
      expect(wrapper.find('Connect(Page)').prop('title')).toBe('Establishment roll')
    })

    it('should render the correct amount of EstablishmentRollBlock components', () => {
      // 1 movement block + 4 blocks + 1 total block
      expect(wrapper.find('EstablishmentRollBlock').length).toEqual(6)
    })

    it('should render the Movements EstablishmentRollBlock first and with the highlighted prop', () => {
      const firstBlock = wrapper.find('EstablishmentRollBlock').first()
      expect(
        firstBlock
          .dive()
          .find('h2')
          .text()
      ).toEqual('Movements')
      expect(firstBlock.props().highlight).toBe(true)
    })

    it('should render an EstablishmentRollBlock for each housing block', () => {
      /* eslint-disable max-nested-callbacks */
      const rollBlocks = wrapper.findWhere(
        rollBlock => rollBlock.name() === 'EstablishmentRollBlock' && rollBlock.prop('highlight') === false
      )
      /* eslint-enable */
      expect(rollBlocks.length).toEqual(4)
    })

    it('should render the Totals EstablishmentRollBlock last and with the highlighted prop', () => {
      const lastBlock = wrapper.find('EstablishmentRollBlock').last()
      expect(
        lastBlock
          .dive()
          .find('h2')
          .text()
      ).toEqual('Totals')
      expect(lastBlock.props().highlight).toBe(true)
    })
  })

  describe('when changing the case load/agency', () => {
    it('should stay on the establishment roll page get the establishment roll blocks for the new case load', () => {
      const newAgencyID = 'MID'
      const getEstablishmentRollBlocksSpy = jest.spyOn(wrapper.instance(), 'getEstablishmentRollBlocks')
      wrapper.setProps({ agencyId: newAgencyID })

      expect(getEstablishmentRollBlocksSpy).toHaveBeenCalledWith(newAgencyID)
    })
  })
})
