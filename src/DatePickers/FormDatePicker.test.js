import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import FormDatePicker from './FormDatePicker'

describe('Form date picker', () => {
  it('should render correctly', () => {
    const wrapper = renderer
      .create(
        <FormDatePicker
          shouldShowDay={() => {}}
          title="date"
          placeholder="Select"
          input={{ name: 'date', onChange: () => {}, value: '2019-10-10T:21:00:00Z' }}
          meta={{ touched: true, error: 'there was an error' }}
        />
      )
      .toJSON()
    expect(wrapper).toMatchSnapshot()
  })
})
