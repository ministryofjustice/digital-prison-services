import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import PaymentReasonContainer from './PaymentReasonContainer';

const store = {
  getState: () => {},
  subscribe: () => {},
  dispatch: () => {}
};

describe('PaymentReasonContainer', () => {
  it('should pass the correct props down to PaymentReasonModal', () => {
    const props = {
      onClose: () => {},
      onConfirm: () => {},
      data: {
        reasons: ['one', 'two'],
        event: { firstName: 'igor', lastName: 'balog' }
      },
      store
    };
    const container = mount(<PaymentReasonContainer {...props} />);
    const modal = container.find('PaymentReasonModal');

    expect(JSON.stringify(modal.props())).toEqual(JSON.stringify({
      onConfirm: props.onConfirm,
      onClose: props.onClose,
      reasons: props.data.reasons,
      event: props.data.event
    }));
  });
});
