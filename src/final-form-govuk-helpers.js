import React from 'react'
import { Field } from 'react-final-form'

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

export const onHandleErrorClick = targetName => {
  document.getElementsByName(targetName)[0].focus()
}
