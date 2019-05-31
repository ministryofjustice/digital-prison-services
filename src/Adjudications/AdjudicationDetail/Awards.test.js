import React from 'react'
import testRenderer from 'react-test-renderer'

import { Awards } from './Awards'

describe('Awards', () => {
  it('should render no award correctly', () => {
    const awards = []

    const wrapper = testRenderer.create(<Awards awards={awards} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })

  it('should render present award correctly', () => {
    const awards = [
      {
        id: '1',
        sanctionType: 'No association',
        duration: '10 Days',
        effectiveDate: '12/03/2018 - 12:21',
        status: 'Active',
        statusDate: '13/03/2018 - 09:00',
        comment: 'Ongoing',
      },
      {
        id: '2',
        sanctionType: 'Reduction of earnings',
        duration: '1 Month, 10 Days',
        effectiveDate: '15/03/2018 - 10:00',
        status: 'Active',
        statusDate: '16/03/2018 - 08:00',
      },
    ]

    const wrapper = testRenderer.create(<Awards awards={awards} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
