import React from 'react'
import { shallow } from 'enzyme'

import AdjudicationDetailContainer from './AdjudicationDetailContainer'
import OffenderPage from '../../OffenderPage'

const initialState = {
  adjudicationHistory: {
    pageNumber: 0,
    pageSize: 20,
  },
}

describe('Adjudication Detail container', () => {
  const store = {}

  beforeEach(() => {
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    store.getState.mockReturnValue(initialState)
  })

  it('should render correctly', () => {
    const wrapper = shallow(
      <AdjudicationDetailContainer
        store={store}
        offenderNumber="AA123BB"
        adjudicationNumber="12345"
        handleError={jest.fn()}
        setLoadedDispatch={jest.fn()}
        resetErrorDispatch={jest.fn()}
      />
    )
    const page = wrapper.dive().find(OffenderPage)

    expect(page.getElement().props.title()).toBe('Adjudication 12345 details')
    expect(page.find('Connect(Detail)').length).toBe(1)
    expect(page.find('Connect(Hearing)').length).toBe(1)
    expect(page.find('Connect(Results)').length).toBe(1)
    expect(page.find('Connect(Awards)').length).toBe(1)
  })
})
