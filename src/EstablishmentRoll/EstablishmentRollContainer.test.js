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
    console.log(wrapper.debug());
    expect(wrapper.find('.establishment-roll-container').exists()).toBe(true);
  });
});
