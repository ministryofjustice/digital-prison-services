import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

export default class WithDataSource extends React.Component {
  constructor(...args) {
    super(...args)
    this.state = {
      error: null,
      data: [],
    }
  }

  componentDidMount() {
    const { request, useExistingData } = this.props
    const { url, params } = request

    if (!useExistingData) {
      axios
        .get(url, { params })
        .then(response =>
          this.setState({
            data: response.data,
          })
        )
        .catch(error =>
          this.setState({
            error,
          })
        )
    }
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
  useExistingData: PropTypes.bool,
}

WithDataSource.defaultProps = {
  useExistingData: false,
}
