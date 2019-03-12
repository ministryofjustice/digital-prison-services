import { Component } from 'react'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { withRouter } from 'react-router-dom'

class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    const { location, always } = this.props

    if (always || location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    const { children } = this.props

    return children
  }
}

ScrollToTop.propTypes = {
  location: ReactRouterPropTypes.location.isRequired,
  children: PropTypes.node.isRequired,
  always: PropTypes.bool,
}

ScrollToTop.defaultProps = {
  always: false,
}

export default withRouter(ScrollToTop)
