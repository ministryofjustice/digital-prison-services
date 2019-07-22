import React from 'react'
import moment from 'moment'
import { shallow } from 'enzyme'
import IEPSlip from '.'

const props = {
  offender: {
    firstName: 'Test',
    lastName: 'Offender',
    offenderNo: 'ABC123',
    cellLocation: 'LEI-123',
  },
  iepValues: {
    pay: 'false',
    absentReason: 'Refused',
    comments: 'Refused to attend',
  },
  activityName: 'Test activity',
  user: {
    activeCaseLoadId: 'LEI',
    name: 'Test User',
  },
  raisedDate: moment('2019-01-01'),
}
describe('<IEPSlip />', () => {
  it('matches the default snapshot', () => {
    const wrapper = shallow(<IEPSlip {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
