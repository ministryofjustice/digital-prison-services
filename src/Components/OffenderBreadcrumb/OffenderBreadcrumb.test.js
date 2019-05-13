import React from 'react'
import { shallow } from 'enzyme'
import { OffenderBreadcrumb } from './OffenderBreadcrumb'

describe('Offender Breadcrumb', () => {
  it('should render correctly', () => {
    const match = { params: { offenderNo: 'AAAA111222' } }
    const wrapper = shallow(<OffenderBreadcrumb match={match} firstName="Bob" lastName="Smith" />)
    expect(wrapper).toMatchSnapshot()
  })
})
