import React from 'react'
import { shallow } from 'enzyme'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import testRenderer from 'react-test-renderer'

import { WithOffenderDetails } from './WithOffenderDetails'

describe('<WithOffenderDetails />', () => {
  const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

  const offender = { firstName: 'Harry', lastName: 'Smith' }

  let mock
  let props
  let setOffender
  let setLoaded
  let handleError
  let resetError

  beforeEach(() => {
    setOffender = jest.fn()
    setLoaded = jest.fn()
    handleError = jest.fn()
    resetError = jest.fn()
    props = { offenderNumber: 'OFF-1', setLoaded, setOffender, handleError, resetError, client: axios }

    mock = new MockAdapter(axios)
  })

  describe('with all props', () => {
    it('On successful api call it populates offender details', async () => {
      mock.onGet(`/api/offenders/${props.offenderNumber}`).reply(200, offender)

      shallow(
        <WithOffenderDetails {...props}>
          <h1>Hello</h1>
        </WithOffenderDetails>
      )
      await waitForAsync()

      expect(resetError).toBeCalled()
      expect(setLoaded).toBeCalled()
      expect(setOffender).toBeCalledWith(offender)
      expect(handleError).not.toBeCalled()
    })

    it('On api call failure it handles the error', async () => {
      mock.onGet(`/api/offenders/${props.offenderNumber}`).reply(500, offender)

      shallow(
        <WithOffenderDetails {...props}>
          <h1>Hello</h1>
        </WithOffenderDetails>
      )
      await waitForAsync()

      expect(resetError).toBeCalled()
      expect(setLoaded).not.toBeCalled()
      expect(setOffender).not.toBeCalled()
      expect(handleError).toBeCalledWith(Error('Request failed with status code 500'))
    })

    it('it renders children', async () => {
      const element = testRenderer.create(
        <WithOffenderDetails {...props}>
          <h1>Hello</h1>
        </WithOffenderDetails>
      )
      await waitForAsync()

      expect(element).toMatchSnapshot()
    })
  })
})
