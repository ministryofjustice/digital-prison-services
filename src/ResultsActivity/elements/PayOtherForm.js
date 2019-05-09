import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Form } from 'react-final-form'
import { FORM_ERROR } from 'final-form'

import Select from '@govuk-react/select'
import TextArea from '@govuk-react/text-area'
import Button from '@govuk-react/button'
import Fieldset from '@govuk-react/fieldset'
import ErrorSummary from '@govuk-react/error-summary'
import { spacing } from '@govuk-react/lib'

import ButtonCancel from './ButtonCancel'
import OffenderName from '../../OffenderName'
import RadioGroup from '../../Components/RadioGroup'
import { FieldWithError, onHandleErrorClick } from '../../final-form-govuk-helpers'

const ButtonContainer = styled.div`
  button {
    ${spacing.responsiveMargin({ size: 3, direction: 'right' })};
  }
`

const validate = values => {
  const formErrors = []

  if (!values.pay) {
    formErrors.push({ targetName: 'pay', text: 'Select a pay option' })
  }

  if (!values.reason) {
    formErrors.push({ targetName: 'reason', text: 'Select a reason' })
  }

  if (!values['case-note']) {
    formErrors.push({ targetName: 'case-note', text: 'Enter a case note' })
  }

  if (formErrors.length > 0) return { [FORM_ERROR]: formErrors }

  return values
}

// Use @govuk-react/panel for form success
class PayOtherForm extends Component {
  componentDidMount() {}

  handleSubmit = () => {}

  render() {
    const { cancelHandler, offender, onSubmit } = this.props

    return (
      <React.Fragment>
        <Form
          onSubmit={validate} // update to validate and submit once we know the endpoint
          render={({ handleSubmit, pristine, submitError: errors, values }) => (
            <form onSubmit={handleSubmit}>
              {errors && (
                <ErrorSummary onHandleErrorClick={onHandleErrorClick} heading="There is a problem" errors={errors} />
              )}
              <Fieldset>
                <Fieldset.Legend size="LARGE" isPageHeading>
                  Do you want to pay <OffenderName firstName={offender.firstName} lastName={offender.lastName} />?
                </Fieldset.Legend>
                <FieldWithError
                  name="pay"
                  errors={errors}
                  component={RadioGroup}
                  options={[{ title: 'Yes', value: 'yes' }, { title: 'No', value: 'no' }]}
                  inline
                />
                <FieldWithError errors={errors} name="reason" component={Select} label="Select a reason">
                  <option value="" disabled hidden>
                    Select
                  </option>
                  {/* Get options from api */}
                  <option value="0">GOV.UK elements option 1</option>
                  <option value="1">GOV.UK elements option 2</option>
                  <option value="2">GOV.UK elements option 3</option>
                </FieldWithError>
                <FieldWithError errors={errors} name="case-note" component={TextArea}>
                  Enter a case note
                </FieldWithError>
              </Fieldset>
              <ButtonContainer>
                <Button type="submit" disabled={pristine} mb={0}>
                  Confirm
                </Button>
                <ButtonCancel mb={0} onClick={cancelHandler} type="button">
                  Cancel
                </ButtonCancel>
              </ButtonContainer>
              <div>
                <hr />
                <pre>{JSON.stringify(values, 0, 2)}</pre>
              </div>
            </form>
          )}
        />
      </React.Fragment>
    )
  }
}

PayOtherForm.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
  offender: PropTypes.shape({ id: PropTypes.string, firstName: PropTypes.string, lastName: PropTypes.string })
    .isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default PayOtherForm
