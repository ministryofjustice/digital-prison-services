import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Form, Field } from 'react-final-form'
import Select from '@govuk-react/select'

import Page from '../Components/Page'
import TimePicker from '../Components/TimePicker/TimePicker'
import DatePickerInput from '../DatePickerInput'
import routePaths from '../routePaths'

import { setApplicationTitle, setLoaded, resetError } from '../redux/actions'
import DatePicker from '../DatePickerInput/datePicker'

import { HorizontallyStacked, Section, FlexContainer } from './appointments.styles'

const onSubmit = values => {}

const AppointmentForm = () => (
  <Form
    onSubmit={onSubmit}
    render={({ handleSubmit, pristine, invalid, submitError }) => (
      <form onSubmit={handleSubmit}>
        <FlexContainer direction="row">
          <Section>
            <Field name="appointmenttype" component={Select} placeholder="Select" label="Appointment type" />
            <HorizontallyStacked>
              <Field name="date" component={DatePicker} label="Select date" />
              <Field name="startTime" component={TimePicker} label="Group start time (optional)" />
            </HorizontallyStacked>
          </Section>

          <Section>
            <Field name="location" component={Select} placeholder="Select" label="Location" />
            <Field name="endTime" component={TimePicker} label="Group end time (optional)" />
          </Section>
        </FlexContainer>

        <button type="submit" disabled={pristine || invalid}>
          Submit
        </button>
      </form>
    )}
  />
)

class Appointments extends Component {
  componentDidMount() {
    const { titleDispatch, setLoadedDispatch, resetErrorDispatch } = this.props

    resetErrorDispatch()
    setLoadedDispatch(true)

    titleDispatch('Whereabouts')
  }

  render() {
    return (
      <Page title="Bulk appoinments">
        <div>
          <AppointmentForm />
        </div>
      </Page>
    )
  }
}

Appointments.propTypes = {
  titleDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = () => ({})
const mapDispatchToProps = dispatch => ({
  titleDispatch: title => dispatch(setApplicationTitle(title)),
  resetErrorDispatch: () => dispatch(resetError()),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Appointments)
