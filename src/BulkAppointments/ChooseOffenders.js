import React from 'react'
import PropTypes from 'prop-types'

const ChooseOffenders = ({ onFileInputChanged }) => (
  <form className="form-group">
    <label className="form-label" htmlFor="file-input">
      Upload a CSV file
    </label>
    <input type="file" id="file-input" onChange={event => onFileInputChanged(event)} accept=".csv" />
  </form>
)

ChooseOffenders.propTypes = {
  onFileInputChanged: PropTypes.func.isRequired,
}

export default ChooseOffenders
