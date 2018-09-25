import React from 'react';
import { shallow } from 'enzyme';
import EstablishmentRollContainer from './EstablishmentRollContainer';
import { movements, blocks } from './establishmentRollDummyData';

describe('<EstablishmentRollContainer />', () => {
  const props = {
    movements,
    blocks
  };
  const wrapper = shallow(<EstablishmentRollContainer {...props} />);

  it('should render without error', () => {
    expect(wrapper.find('.establishment-roll-container').exists()).toBe(true);
  });

  it('should have the correct page title', () => {
    expect(wrapper.find('.heading-large').text()).toBe('Establishment roll');
  });

  it('should render the correct amount of EstablishmentRollBlock components', () => {
    // 1 movement block + 4 blocks + 1 total block
    expect(wrapper.find('EstablishmentRollBlock').length).toEqual(6);
  });

  it('should render the Movements EstablishmentRollBlock first', () => {
    const firstBlock = wrapper.find('EstablishmentRollBlock').first();
    expect(firstBlock.dive().find('h2').text()).toEqual('Movements');
    expect(firstBlock.props().highlight).toBe(true);
  });

  it('should render a EstablishmentRollBlock for each housing block', () => {
    const blocks = wrapper.findWhere(
      (block) => block.name() === 'EstablishmentRollBlock' && block.prop('highlight') === undefined,
    );
    expect(blocks.length).toEqual(4);
  });

  it('should render the Totals EstablishmentRollBlock last with the highlighted prop', () => {
    const lastBlock = wrapper.find('EstablishmentRollBlock').last();
    expect(lastBlock.dive().find('h2').text()).toEqual('Totals');
    expect(lastBlock.props().highlight).toBe(true);
  });
});
