import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Header from '@govuk-react/header'
import Error from '../../Error'
import Spinner from '../../Spinner'
import { Container } from './Page.styles'
import { childrenType } from '../../types'
import Breadcrumb from '../Breadcrumb'

export class Page extends Component {
  componentDidMount() {
    const { title } = this.props
    this.renderTitleString(title)
  }

  componentWillUpdate(nextProps) {
    this.renderTitleString(nextProps.title)
  }

  renderTitleString = title => {
    document.title = `${title} - Whereabouts - Prison NOMIS`
  }

  render() {
    const { error, loaded, title, children, alwaysRender, showBreadcrumb, homeLink } = this.props

    if (loaded || error) {
      return (
        <Fragment>
          {showBreadcrumb && <Breadcrumb homeLink={homeLink} />}
          <Container>
            <Header level={1} size="LARGE">
              {title}
            </Header>
            {error && <Error error={error} />}
            {(!error || alwaysRender) && <div className="page-content">{children}</div>}
          </Container>
        </Fragment>
      )
    }

    return <Spinner />
  }
}

Page.propTypes = {
  error: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: childrenType.isRequired,
  alwaysRender: PropTypes.bool,
  showBreadcrumb: PropTypes.bool,
  homeLink: PropTypes.string.isRequired,
}

Page.defaultProps = {
  alwaysRender: false,
  showBreadcrumb: true,
}

const mapStateToProps = state => ({
  error: state.app.error,
  loaded: state.app.loaded,
  homeLink: state.app.config.notmEndpointUrl,
})

export default connect(mapStateToProps)(Page)
