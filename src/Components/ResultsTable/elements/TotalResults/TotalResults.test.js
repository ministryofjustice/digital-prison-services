import React from 'react'
import { shallow } from 'enzyme'
import TotalResults from '.'

describe('<TotalResults />', () => {
  it('should match the default snapshot', () => {
    const wrapper = shallow(<TotalResults label="Prisoners listed:" />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should match with value snapshot', () => {
    const wrapper = shallow(<TotalResults label="Prisoners listed:" totalResults={10} />)

    expect(wrapper).toMatchSnapshot()
  })
})
