import React from 'react'
import { shallow } from 'enzyme'
import { OffenderBreadcrumb } from './OffenderBreadcrumb'

describe('Offender Breadcrumb', () => {
  it('should render correctly when values are present', () => {
    const match = { params: { offenderNo: 'AAAA111222' } }
    const wrapper = shallow(<OffenderBreadcrumb match={match} firstName="Bob" lastName="Smith" />)
    expect(wrapper.debug()).toMatchSnapshot()
  })
  it('should render correctly when values are not present', () => {
    const match = { params: { offenderNo: 'AAAA111222' } }
    const wrapper = shallow(<OffenderBreadcrumb match={match} />)
    expect(wrapper.debug()).toMatchSnapshot()
  })
})
