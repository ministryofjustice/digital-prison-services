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
    setCaseChangeRedirectStatusDispatch: jest.fn(),
    establishmentRollBlockDataDispatch: jest.fn(),
    setLoadedDispatch: jest.fn(),
    handleError: jest.fn(),
    loaded: false,
  }

  const wrapper = shallow(<EstablishmentRollContainer {...props} />)

  describe('when loading the data', () => {
    it('should display the loading <Spinner /> component', () => {
      expect(wrapper.find('Spinner').exists()).toBe(true)
    })
  })

  describe('when the data has loaded', () => {
    beforeEach(() => {
      wrapper.setProps({ loaded: true })
    })

    it('should render without error', () => {
      expect(wrapper.find('.establishment-roll-container').exists()).toBe(true)
    })

    it('should have the correct page title', () => {
      expect(wrapper.find('.heading-large').text()).toBe('Establishment roll')
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

    it('should render a EstablishmentRollBlock for each housing block', () => {
      /* eslint-disable max-nested-callbacks */
      const rollBlocks = wrapper.findWhere(
        rollBlock => rollBlock.name() === 'EstablishmentRollBlock' && rollBlock.prop('highlight') === undefined
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

      expect(props.setCaseChangeRedirectStatusDispatch).toHaveBeenCalledWith(false)
      expect(getEstablishmentRollBlocksSpy).toHaveBeenCalledWith(newAgencyID)
    })
  })
})
