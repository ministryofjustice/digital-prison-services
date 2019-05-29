import React from 'react'
import testRenderer from 'react-test-renderer'

import { Results } from './Results'

describe('Results', () => {
  it('should render no results correctly', () => {
    const results = []

    const wrapper = testRenderer.create(<Results results={results} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })

  it('should render present results correctly', () => {
    const results = [
      {
        id: '1',
        oicOffenceCode: '12:21',
        offenceType: 'Adult',
        offenceDescription: 'Assault',
        plea: 'Not Guilty',
        finding: 'Guilty',
      },
      {
        id: '2',
        oicOffenceCode: '23D',
        offenceType: 'Adult',
        offenceDescription: 'Stealing',
        plea: 'Not Guilty',
        finding: 'Not Proved',
      },
    ]

    const wrapper = testRenderer.create(<Results results={results} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
