import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'
import { resetError, setLoaded } from '../redux/actions'

class WithDataSource extends React.Component {
  constructor(...args) {
    super(...args)
    this.state = {
      error: null,
      data: [],
    }
  }

  componentDidMount() {
    const { request, setLoadedDispatch, resetErrorDispatch } = this.props
    const { url, params } = request

    resetErrorDispatch()

    axios
      .get(url, { params })
      .then(response => {
        setLoadedDispatch(true)
        this.setState({
          data: response.data,
        })
      })
      .catch(error =>
        this.setState({
          error,
        })
      )
  }

  render() {
    const { render } = this.props
    const { data, error } = this.state

    return render({
      data,
      error,
    })
  }
}

WithDataSource.propTypes = {
  request: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.object,
  }).isRequired,
  render: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = () => ({})
const mapDispatchToProps = dispatch => ({
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  resetErrorDispatch: () => dispatch(resetError()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithDataSource)
