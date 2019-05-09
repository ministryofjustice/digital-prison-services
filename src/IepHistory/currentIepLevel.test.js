import React from 'react'
import { shallow } from 'enzyme'
import CurrentIepLevel from './CurrentIepLevel'

describe('Current IEP Level', () => {
  it('should render the page correctly', () => {
    const wrapper = shallow(<CurrentIepLevel level="Basic" days={20} nextReviewDate="20/09/2019" />)

    expect(wrapper).toMatchSnapshot()
  })
})
