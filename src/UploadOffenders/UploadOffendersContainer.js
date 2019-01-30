import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'
import Page from '../Components/Page/Page'
import { resetError, setApplicationTitle, setLoaded } from '../redux/actions'

class UploadOffendersContainer extends Component {
  constructor() {
    super()
    this.state = {
      offenders: [],
    }
  }

  componentDidMount() {
    const { titleDispatch, setLoadedDispatch, resetErrorDispatch } = this.props

    resetErrorDispatch()
    setLoadedDispatch(true)

    titleDispatch('Appointments')
  }

  async onFileInputChanged(event) {
    const { handleError, resetErrorDispatch } = this.props
    resetErrorDispatch()

    try {
      event.preventDefault()
      const files = Array.from(event.target.files)
      const file = files[0]

      const formData = new FormData()
      formData.append('offenders', file)

      const response = await axios.post('/api/appointments/upload-offenders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      this.setState({
        offenders: response.data,
      })
    } catch (error) {
      handleError(error)
    }
  }

  render() {
    const { offenders } = this.state

    return (
      <Page title="Bulk upload offenders">
        <form className="form-group">
          <div>
            <h3 className="heading-medium">CSV example below</h3>
            <p style={{ border: 'solid 1px', padding: '2em' }}>
              G2899UN,
              <br />
              G3840UE, 14:00
              <br />
            </p>
          </div>
          <label className="form-label" htmlFor="file-input">
            Upload a CSV file
          </label>
          <input type="file" id="file-input" onChange={event => this.onFileInputChanged(event)} accept=".csv" />
        </form>

        {offenders && (
          <React.Fragment>
            <table className="row-gutters">
              <thead>
                <tr>
                  <th className="straight width5">Prison no.</th>
                  <th className="straight width15"> Last name </th>
                  <th className="straight width15"> First name </th>
                  <th className="straight width15"> Start time </th>
                  <th className="straight width15"> Appointment clash </th>
                </tr>
              </thead>
              <tbody>
                {offenders.map(row => (
                  <tr className="row-gutters" key={[row.offenderNo].join('_')}>
                    <td className="row-gutters">{row.offenderNo}</td>

                    <td className="row-gutters">{row.lastName}</td>

                    <td className="row-gutters">{row.firstName}</td>

                    <td className="row-gutters">
                      <input className="form-control" defaultValue={row.startTime} />
                      <input className="form-control" />
                    </td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </React.Fragment>
        )}
      </Page>
    )
  }
}

UploadOffendersContainer.propTypes = {
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  titleDispatch: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
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
)(UploadOffendersContainer)
