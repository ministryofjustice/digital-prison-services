import React from 'react'
import { shallow } from 'enzyme'
import IepHistory from './IepHistory'

describe('IEP History', () => {
  it('should render the page correctly', () => {
    const iepHistory = [
      {
        bookingId: -1,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        formattedTime: '15/08/2017 - 16:04',
        agencyId: 'LEI',
        iepLevel: 'Standard',
        comments: 'Test comment.',
      },
    ]
    const wrapper = shallow(<IepHistory iepHistory={iepHistory} />)

    expect(wrapper).toMatchSnapshot()
  })
})
