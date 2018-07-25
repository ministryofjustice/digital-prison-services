import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import PaymentReasonModal from './index';

Enzyme.configure({ adapter: new Adapter() });

describe('PaymentReasonModal', () => {
  it('should call onClose when the cancel button has been clicked', () => {
    const props = {
      onClose: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      }
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('.greyButton').simulate('click');

    expect(props.onClose).toHaveBeenCalled();
  });


  it('should call onConfirm with the selected reason and comment', () => {
    const props = {
      onConfirm: jest.fn(),
      reasons: ['Refused', 'Left in Cell'],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      }
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('#payment-reason-reason').first().simulate('change', {
      target: {
        value: 'Refused'
      } });

    modal.find('#payment-reason-comment').first().simulate('change', {
      target: {
        value: 'comment1'
      } });

    modal.find('.button').simulate('click');

    expect(props.onConfirm).toHaveBeenCalledWith({ reason: 'Refused', comment: 'comment1', event: props.event });
  });

  it('should not allow the user to confirm when reason and comment is missing', () => {
    const props = {
      onConfirm: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      }
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('.button').simulate('click');

    expect(modal.find('.error-message').get(0).props.children).toBe('Please select a reason.');
    expect(modal.find('.error-message').get(1).props.children).toBe('Please select a comment.');
    expect(modal.find('.form-group-error').length).toBe(2);
    expect(modal.find('.form-control-error').length).toBe(2);

    expect(props.onConfirm.mock.calls.length).toBe(0);
  });

  it('should not remove validation errors when the missing fields have been inputted', () => {
    const props = {
      onConfirm: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      }
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('.button').simulate('click');

    modal.find('#payment-reason-reason').first().simulate('change', {
      target: {
        value: 'Refused'
      } });

    modal.find('#payment-reason-comment').first().simulate('change', {
      target: {
        value: 'comment1'
      } });

    modal.find('.button').simulate('click');

    expect(modal.find('.error-message').length).toBe(0);
    expect(modal.find('.form-group-error').length).toBe(0);
    expect(modal.find('.form-control-error').length).toBe(0);

    expect(props.onConfirm).toHaveBeenCalled();
  });
});
