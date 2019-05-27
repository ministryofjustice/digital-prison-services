import React from 'react'
import testRenderer from 'react-test-renderer'

import { Hearing } from './Hearing'

describe('Hearing', () => {
  it('should render missing hearing correctly', () => {
    const wrapper = testRenderer.create(<Hearing />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })

  it('should render empty data correctly', () => {
    const hearing = {}

    const wrapper = testRenderer.create(<Hearing hearing={hearing} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })

  it('should render present hearing correctly', () => {
    const hearing = {
      hearingType: 'Adult',
      hearingTime: '12/04/2017 - 12:54',
      location: 'MDI-CR-12',
      heardByName: 'Jane Smith',
      otherRepresentatives: 'CLLR Jones',
      comment: 'Nothing really',
    }

    const wrapper = testRenderer.create(<Hearing hearing={hearing} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
