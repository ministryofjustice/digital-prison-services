import React from 'react'
import { shallow } from 'enzyme'

import FormDatePicker from './formDatePicker'

describe('Form date picker', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <FormDatePicker
        shouldShowDay={() => {}}
        title="date"
        placeholder="Select"
        input={{ name: 'date', onChange: () => {}, value: '2019-10-10T:21:00:00Z' }}
        meta={{ touched: true, error: 'there was an error' }}
      />
    )
    expect(wrapper.dive()).toMatchSnapshot()
  })
})
