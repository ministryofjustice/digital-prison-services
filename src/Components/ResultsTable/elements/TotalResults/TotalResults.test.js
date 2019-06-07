import React from 'react'
import { shallow } from 'enzyme'
import TotalResults from '.'

describe('<TotalResults />', () => {
  it('should match the default snapshot', () => {
    const wrapper = shallow(<TotalResults />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should match with value snapshot', () => {
    const wrapper = shallow(<TotalResults totalResults={10} />)

    expect(wrapper).toMatchSnapshot()
  })
})
