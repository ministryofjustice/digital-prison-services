import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import Button from '@govuk-react/button'
import Label from '@govuk-react/label'
import LabelText from '@govuk-react/label-text'

import { BLACK, GREY_3 } from 'govuk-colours'
import { Container } from './OffenderUpload.styles'

const createFileFormDataFromEvent = event => {
  const files = Array.from(event.target.files)
  const file = files[0]

  const formData = new FormData()
  formData.append('file', file)

  return formData
}

const onFileInputChanged = async ({ event, onError, onSuccess, agencyId }) => {
  try {
    event.preventDefault()
    if (!event.target.files) return
    const formData = createFileFormDataFromEvent(event)

    const response = await axios.post(`/api/appointments/upload-offenders/${agencyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    onSuccess(response.data)
  } catch (error) {
    onSuccess([])
    onError(error)
  }
}

const OffenderUpload = ({ onError, onSuccess, onCancel, showCancelButton, agencyId }) => (
  <>
    <Container>
      <a href="/bulk-appointments/csv-template" className="link">
        Download CSV template
      </a>
      <Label htmlFor="file-input">
        <LabelText> Upload a CSV file </LabelText>
        <input
          name="file"
          type="file"
          id="file-input"
          onChange={event => onFileInputChanged({ event, onError, onSuccess, agencyId })}
          accept=".csv"
        />
      </Label>
    </Container>
    {showCancelButton && (
      <Button buttonColour={GREY_3} buttonTextColour={BLACK} onClick={e => onCancel(e)}>
        Cancel
      </Button>
    )}
  </>
)

OffenderUpload.propTypes = {
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  showCancelButton: PropTypes.bool,
  agencyId: PropTypes.string.isRequired,
}

OffenderUpload.defaultProps = {
  showCancelButton: true,
}

export default OffenderUpload
