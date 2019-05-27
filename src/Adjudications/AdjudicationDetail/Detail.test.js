import React from 'react'
import testRenderer from 'react-test-renderer'

import { Detail } from './Detail'

describe('Hearing', () => {
  it('should render empty data correctly', () => {
    const detail = {}

    const wrapper = testRenderer.create(<Detail detail={detail} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })

  it('should render present detail correctly', () => {
    const detail = {
      incidentTime: '12/04/2014 - 12:32',
      reportType: 'General',
      establishment: 'Moorland HMP',
      incidentDetails: 'A crime occurred',
      interiorLocation: 'WING-A',
      reportNumber: 123456,
      reporterName: 'Jo Smith',
      reporterTime: '15/04/2014 - 10:00',
    }

    const wrapper = testRenderer.create(<Detail detail={detail} />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
