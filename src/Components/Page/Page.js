import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Header from '@govuk-react/header'
import BackLink from '@govuk-react/back-link'
import Error from '../../Error'
import Spinner from '../../Spinner'
import { Container } from './Page.styles'
import { childrenType } from '../../types'
import Breadcrumb from '../Breadcrumb'
import { setApplicationTitle } from '../../redux/actions'

export class Page extends Component {
  componentDidMount() {
    const { title, applicationTitle, dispatchApplicationTitle } = this.props

    this.renderTitleString(title)

    if (applicationTitle) {
      dispatchApplicationTitle(applicationTitle)
    }
  }

  componentWillUpdate(nextProps) {
    this.renderTitleString(nextProps.title)
  }

  renderTitleString = title => {
    const appName = 'Whereabouts - Prison NOMIS'
    document.title = title ? `${title} - ${appName}` : appName
  }

  render() {
    const { error, loaded, title, children, alwaysRender, showBreadcrumb, homeLink, backLink } = this.props

    if (loaded || error) {
      return (
        <Fragment>
          {showBreadcrumb && <Breadcrumb homeLink={homeLink} />}
          {backLink && <BackLink href={backLink}>Back</BackLink>}
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
  title: PropTypes.string,
  children: childrenType,
  alwaysRender: PropTypes.bool,
  showBreadcrumb: PropTypes.bool,
  homeLink: PropTypes.string.isRequired,
  backLink: PropTypes.string,
  applicationTitle: PropTypes.string,
  dispatchApplicationTitle: PropTypes.func,
}

Page.defaultProps = {
  alwaysRender: false,
  showBreadcrumb: true,
  backLink: '',
  title: undefined,
  children: undefined,
  applicationTitle: '',
  dispatchApplicationTitle: () => {},
}

const mapDispatchToProps = dispatch => ({
  dispatchApplicationTitle: title => dispatch(setApplicationTitle(title)),
})

const mapStateToProps = state => ({
  error: state.app.error,
  loaded: state.app.loaded,
  homeLink: state.app.config.notmEndpointUrl,
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Page)
