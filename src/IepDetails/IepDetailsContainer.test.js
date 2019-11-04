import React from 'react'
import { shallow } from 'enzyme'
import { IepDetailsContainer } from './IepDetailsContainer'

describe('IEP Details Container', () => {
  const props = {
    offenderNo: 'ABC123',
    handleError: jest.fn(),
    setIepHistoryResults: jest.fn(),
    setIepHistoryFilter: jest.fn(),
    history: {
      replace: jest.fn(),
    },
    fieldValues: {
      establishment: undefined,
      level: undefined,
      fromDate: undefined,
      toDate: undefined,
    },
    resetErrorDispatch: jest.fn(),
    setLoadedDispatch: jest.fn(),
  }

  const wrapper = shallow(<IepDetailsContainer {...props} />)

  describe('filter values', () => {
    it('should update correctly when results are updated', () => {
      wrapper.instance().updateResults({ establishment: 'TEST', level: 'Enhanced' })

      expect(props.setIepHistoryFilter).toHaveBeenCalledWith({
        establishment: 'TEST',
        fromDate: undefined,
        level: 'Enhanced',
        toDate: undefined,
      })
    })
  })
})
