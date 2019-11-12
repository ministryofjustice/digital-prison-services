import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router'
import { EstablishmentRollContainer } from './EstablishmentRollContainer'
import { movements, blocks, totals } from './establishmentRollDummyData'

describe('<EstablishmentRollContainer />', () => {
  const props = {
    agencyId: 'LEI',
    establishmentRollBlockDataDispatch: jest.fn(),
    handleError: jest.fn(),
    setLoadedDispatch: jest.fn(),
    resetErrorDispatch: jest.fn(),
    establishmentRollDataDispatch: jest.fn(),
    titleDispatch: jest.fn(),
  }

  describe('when loading', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <EstablishmentRollContainer {...props} />
      </MemoryRouter>
    )

    it('should not display any blocks', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      expect(container.find('withRouter(EstablishmentRollBlock)').exists()).toBe(false)
    })
  })

  describe('when loaded', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <EstablishmentRollContainer {...props} movements={movements} blocks={blocks} totals={totals} />
      </MemoryRouter>
    )

    it('should render without error', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      expect(container.find('.establishment-roll-container').exists()).toBe(true)
    })

    it('should have the correct page title', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      expect(container.find('Connect(Page)').prop('title')).toBe('Establishment roll')
    })

    it('should render the correct amount of EstablishmentRollBlock components', () => {
      // 1 movement block + 4 blocks + 1 total block
      const container = wrapper.find('EstablishmentRollContainer').dive()
      expect(container.find('withRouter(EstablishmentRollBlock)').length).toEqual(6)
    })

    it('should render the Movements EstablishmentRollBlock first and with the highlighted prop', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      const firstBlock = container.find('withRouter(EstablishmentRollBlock)').first()

      expect(firstBlock.props().highlight).toBe(true)
      expect(firstBlock.props().block.name).toEqual('Movements')
    })

    it('should render an EstablishmentRollBlock for each housing block', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      /* eslint-disable max-nested-callbacks */
      const rollBlocks = container.findWhere(
        rollBlock => rollBlock.name() === 'withRouter(EstablishmentRollBlock)' && !rollBlock.prop('highlight')
      )
      /* eslint-enable */
      expect(rollBlocks.length).toEqual(4)
    })

    it('should render the Totals EstablishmentRollBlock last and with the highlighted prop', () => {
      const container = wrapper.find('EstablishmentRollContainer').dive()
      const lastBlock = container.find('withRouter(EstablishmentRollBlock)').last()
      expect(lastBlock.props().highlight).toBe(true)
      expect(lastBlock.props().block.name).toEqual('Totals')
    })
  })

  describe('when changing the case load/agency', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <EstablishmentRollContainer {...props} />
      </MemoryRouter>
    )

    it('should stay on the establishment roll page get the establishment roll blocks for the new case load', () => {
      const newAgencyID = 'MID'
      const container = wrapper.find('EstablishmentRollContainer').dive()
      const getEstablishmentRollBlocksSpy = jest.spyOn(container.instance(), 'getEstablishmentRollBlocks')
      container.setProps({ agencyId: newAgencyID })

      expect(getEstablishmentRollBlocksSpy).toHaveBeenCalledWith(newAgencyID)
    })
  })
})
