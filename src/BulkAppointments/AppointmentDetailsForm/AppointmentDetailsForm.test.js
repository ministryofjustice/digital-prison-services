import React from 'react'
import testRenderer from 'react-test-renderer'
import moment from 'moment'

import { Form } from 'react-final-form'
import AppointmentDetailsForm, { FormFields } from './AppointmentDetailsForm'
import { DATE_TIME_FORMAT_SPEC } from '../../dateHelpers'

describe('Appointment form', () => {
  it('should render correctly', () => {
    const tree = testRenderer
      .create(
        <AppointmentDetailsForm
          onCancel={jest.fn()}
          onSuccess={jest.fn()}
          onError={jest.fn()}
          now={moment('2019-01-01T21:00:00Z', DATE_TIME_FORMAT_SPEC)}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should pass correct props to all fields', () => {
    Date.now = jest.fn(() => new Date(Date.UTC(2017, 0, 1)).valueOf())

    const tree = testRenderer
      .create(
        <Form
          onSubmit={() => {}}
          render={() => (
            <FormFields
              values={{ date: moment('2019-01-01T21:00:00Z', DATE_TIME_FORMAT_SPEC) }}
              now={moment('2019-01-01T21:00:00Z', DATE_TIME_FORMAT_SPEC)}
              appointmentTypes={[{ id: '1', description: 'app1' }]}
              locationTypes={[{ id: 1, description: 'loc1' }]}
              errors={[
                { targetName: 'date', text: 'Date test message' },
                { targetName: 'startTime', text: 'Start test message' },
                { targetName: 'endTime', text: 'End time test message' },
                { targetName: 'comments', text: 'Date test message' },
                { targetName: 'appointmentType', text: 'appointment type test message' },
                { targetName: 'locationType', text: 'location type test message' },
              ]}
            />
          )}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
