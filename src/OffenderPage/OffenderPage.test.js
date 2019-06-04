import React from 'react'
import { shallow } from 'enzyme'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { OffenderPage } from './OffenderPage'

describe('<OffenderPage />', () => {
  const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

  const offenderDetails = { firstName: 'Harry', lastName: 'Smith' }

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
    const title = jest.fn()
    props = {
      offenderNumber: 'OFF-1',
      setLoaded,
      setOffender,
      handleError,
      resetError,
      client: axios,
      title,
      offenderDetails,
    }

    mock = new MockAdapter(axios)
  })

  describe('with all props', () => {
    it('On successful api call it populates offender details', async () => {
      mock.onGet(`/api/offenders/${props.offenderNumber}`).reply(200, offenderDetails)

      shallow(
        <OffenderPage {...props}>
          <h1>Hello</h1>
        </OffenderPage>
      )
      await waitForAsync()

      expect(resetError).toBeCalled()
      expect(setLoaded).toBeCalled()
      expect(setOffender).toBeCalledWith({ offenderNo: props.offenderNumber, ...offenderDetails })
      expect(handleError).not.toBeCalled()
    })

    it('On api call failure it handles the error', async () => {
      mock.onGet(`/api/offenders/${props.offenderNumber}`).reply(500, 'An error occurred')

      shallow(
        <OffenderPage {...props}>
          <h1>Hello</h1>
        </OffenderPage>
      )
      await waitForAsync()

      expect(resetError).toBeCalled()
      expect(setLoaded).not.toBeCalled()
      expect(setOffender).not.toBeCalled()
      expect(handleError).toBeCalledWith(Error('Request failed with status code 500'))
    })

    it('it renders page title', async () => {
      const element = shallow(
        <OffenderPage
          {...props}
          offenderDetails={{
            firstName: 'Bob',
            lastName: 'Smith',
          }}
          title={({ firstName, lastName }) => `A Page for ${firstName} ${lastName}`}
        >
          <h1>Hello</h1>
        </OffenderPage>
      )
      await waitForAsync()

      expect(element.debug()).toMatchSnapshot()
    })

    it('it does not render title if offender details are absent', async () => {
      const element = shallow(
        <OffenderPage
          {...props}
          title={({ firstName, lastName }) => `A Page for ${firstName} ${lastName}`}
          offenderDetails={{}}
        >
          <h1>Hello</h1>
        </OffenderPage>
      )
      await waitForAsync()

      expect(element.debug()).toMatchSnapshot()
    })
  })
})
