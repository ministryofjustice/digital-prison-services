import React from 'react'
import { shallow } from 'enzyme'
import NumericInput from './NumericInput'

describe('NumericInput', () => {
  it('should render correctly', () => {
    const input = {
      name: 'age',
      onChange: () => {},
    }
    const wrapper = shallow(<NumericInput input={input} label="Age" hint="Enter a value between 1 and 120" />)
    expect(wrapper).toMatchSnapshot()
  })

  it('should render with errors', () => {
    const input = {
      name: 'age',
      onChange: () => {},
    }
    const meta = {
      touched: true,
      error: 'Please enter an age between 1 and 120',
    }
    const wrapper = shallow(
      <NumericInput input={input} label="Age" hint="Enter a value between 1 and 120" meta={meta} />
    )
    expect(wrapper).toMatchSnapshot()
  })
})
