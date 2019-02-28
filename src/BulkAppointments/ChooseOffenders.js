import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import Label from '@govuk-react/label'
import LabelText from '@govuk-react/label-text'

import { Container } from './ChooseOffenders.styles'

const createFileFormDataFromEvent = event => {
  const files = Array.from(event.target.files)
  const file = files[0]

  const formData = new FormData()
  formData.append('file', file)

  return formData
}

const onFileInputChanged = async ({ event, onError, onSuccess }) => {
  try {
    event.preventDefault()
    const formData = createFileFormDataFromEvent(event)

    const response = await axios.post('/api/appointments/upload-offenders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    onSuccess(response.data)
  } catch (error) {
    onError(error)
  }
}

const ChooseOffenders = ({ onError, onSuccess }) => (
  <Container>
    <Label htmlFor="file-input">
      <LabelText> Upload a CSV file </LabelText>
      <input
        name="file"
        type="file"
        id="file-input"
        onChange={event => onFileInputChanged({ event, onError, onSuccess })}
        accept=".csv"
      />
    </Label>

    <a href="/bulk-appointments/csv-template" className="link">
      Download template
    </a>
  </Container>
)

ChooseOffenders.propTypes = {
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default ChooseOffenders
