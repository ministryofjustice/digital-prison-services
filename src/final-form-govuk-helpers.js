import React from 'react'
import { Field } from 'react-final-form'

const lookupError = (name, errors) => {
  const error = errors && errors.find(s => s.targetName === name)
  return error && error.text
}

const FieldWithError = props => {
  const { name, errors } = props
  const error = lookupError(name, errors)
  const meta = {
    touched: Boolean(error),
    error,
  }
  return <Field {...props} meta={meta} />
}

export default FieldWithError
