import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import PaymentReasonModal from './index';

Enzyme.configure({ adapter: new Adapter() });

describe('PaymentReasonModal', () => {
  it('should call onClose when the cancel button has been clicked', () => {
    const props = {
      onConfirm: jest.fn(),
      onClose: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      },
      handleError: jest.fn()
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('.greyButton').simulate('click');

    expect(props.onClose).toHaveBeenCalled();
  });


  it('should call onConfirm with the selected reason and comment, and onClose', () => {
    const props = {
      onConfirm: jest.fn(),
      onClose: jest.fn(),
      reasons: [{ value: 'Refused', commentRequired: true }, { value: 'Left in Cell', commentRequired: true }],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      },
      handleError: jest.fn()
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('#payment-reason-reason').first().simulate('change', {
      target: {
        value: 'Refused',
        selectedIndex: 44
      } });

    modal.find('#payment-reason-comment').first().simulate('change', {
      target: {
        value: 'comment1'
      } });

    modal.find('.button').simulate('click');

    expect(props.onConfirm).toHaveBeenCalled();
    expect(props.onConfirm.mock.calls[0][0].reason).toEqual({ key: 43, value: 'Refused' });
    expect(props.onConfirm.mock.calls[0][0].reasons).toEqual([{ value: 'Refused', commentRequired: true }, { value: 'Left in Cell', commentRequired: true }]);
    expect(props.onConfirm.mock.calls[0][0].event).toBe(props.event);
    expect(props.onConfirm.mock.calls[0][0].comment).toEqual('comment1');
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should not allow the user to confirm when reason and comment is missing', () => {
    const props = {
      onConfirm: jest.fn(),
      onClose: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      },
      handleError: jest.fn()
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('.button').simulate('click');

    expect(modal.find('.error-message').get(0).props.children).toBe('Please select a reason.');
    expect(modal.find('.form-group-error').length).toBe(1);
    expect(modal.find('.form-control-error').length).toBe(1);

    expect(props.onConfirm.mock.calls.length).toBe(0);
  });

  it('should allow the user to confirm when comment is missing and reason implies comment is optional', () => {
    const props = {
      onConfirm: jest.fn(),
      onClose: jest.fn(),
      reasons: [{ value: 'Cancelled', commentRequired: false }, { value: 'Left in Cell', commentRequired: true }],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      },
      handleError: jest.fn()
    };
    const modal = shallow(<PaymentReasonModal {...props} />);

    modal.find('#payment-reason-reason').first().simulate('change', {
      target: {
        value: 'Cancelled',
        selectedIndex: 1
      } });

    modal.find('.button').simulate('click');

    expect(props.onConfirm).toHaveBeenCalled();
    expect(props.onConfirm.mock.calls[0][0].reason).toEqual({ key: 0, value: 'Cancelled' });
    expect(props.onConfirm.mock.calls[0][0].reasons).toBe(props.reasons);
    expect(props.onConfirm.mock.calls[0][0].event).toBe(props.event);
    expect(props.onClose).toHaveBeenCalled();
    expect(modal.find('.form-group-error').length).toBe(0);
    expect(modal.find('.form-control-error').length).toBe(0);

    expect(props.onConfirm.mock.calls.length).toBe(1);
  });

  it('should not remove validation errors when the missing fields have been inputted', () => {
    const props = {
      onConfirm: jest.fn(),
      onClose: jest.fn(),
      reasons: [],
      event: {
        firstName: 'igor',
        lastName: 'balog'
      },
      handleError: jest.fn()
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
