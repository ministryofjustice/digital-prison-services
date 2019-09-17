import React from 'react'
import PropTypes from 'prop-types'
import { Field } from 'react-final-form'
import { OnChange } from 'react-final-form-listeners'

const lookupError = (name, errors) => {
  const error = errors && errors.find(s => s.targetName === name)
  return error && error.text
}

export const FieldWithError = props => {
  const { name, errors } = props
  const error = lookupError(name, errors)
  const meta = {
    touched: Boolean(error),
    error,
  }

  return <Field {...props} meta={meta} mb={6} />
}

// https://medium.com/@erikras/declarative-form-rules-c5949ea97366
const WhenFieldChanges = ({ field, becomes, set, to }) => (
  <Field name={set} subscription={{}}>
    {(
      // No subscription. We only use Field to get to the change function
      { input: { onChange } }
    ) => (
      <OnChange name={field}>
        {value => {
          if (value === becomes) {
            onChange(to)
          }
        }}
      </OnChange>
    )}
  </Field>
)

WhenFieldChanges.propTypes = {
  field: PropTypes.node.isRequired,
  becomes: PropTypes.string.isRequired,
  set: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
}

FieldWithError.propTypes = {
  name: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.shape({})),
}

FieldWithError.defaultProps = {
  errors: [],
}

export { WhenFieldChanges }

export const onHandleErrorClick = targetName => {
  document.getElementsByName(targetName)[0].focus()
}
