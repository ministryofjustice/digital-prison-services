import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { H1 } from '@govuk-react/heading'
import BackLink from '@govuk-react/back-link'
import Error from '../../Error'
import Spinner from '../../Spinner'
import { Container, PageHeader } from './Page.styles'
import { childrenType } from '../../types'
import Breadcrumb from '../Breadcrumb'
import { setApplicationTitle } from '../../redux/actions'
import PrintLink from './elements/PrintLink'

export class Page extends Component {
  componentDidMount() {
    const { title, docTitle, applicationTitle, dispatchApplicationTitle } = this.props
    this.renderTitleString(title, docTitle)

    if (applicationTitle) {
      dispatchApplicationTitle(applicationTitle)
    }
  }

  componentWillUpdate(nextProps) {
    this.renderTitleString(nextProps.title, nextProps.docTitle)
  }

  renderTitleString = (title, docTitle) => {
    const appName = 'Digital Prison Services'
    document.title = title ? `${docTitle || title} - ${appName}` : appName
  }

  render() {
    const { error, loaded, title, children, alwaysRender, showBreadcrumb, homeLink, backLink, showPrint } = this.props

    if (alwaysRender || loaded || error) {
      return (
        <>
          {alwaysRender && !loaded && <Spinner />}
          {showBreadcrumb && <Breadcrumb homeLink={homeLink} />}
          {backLink && <BackLink href={backLink}>Back</BackLink>}
          <Container>
            <PageHeader>
              <H1 size="LARGE">{title}</H1>
              {showPrint && (
                <div>
                  <PrintLink />
                </div>
              )}
            </PageHeader>
            {error && <Error error={error} />}
            {(!error || alwaysRender) && <div className="page-content">{children}</div>}
          </Container>
          {showPrint && <PrintLink bottom />}
        </>
      )
    }

    return <Spinner />
  }
}

Page.propTypes = {
  error: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
  title: PropTypes.string,
  docTitle: PropTypes.string,
  children: childrenType,
  alwaysRender: PropTypes.bool,
  showBreadcrumb: PropTypes.bool,
  homeLink: PropTypes.string.isRequired,
  backLink: PropTypes.string,
  applicationTitle: PropTypes.string,
  dispatchApplicationTitle: PropTypes.func,
  showPrint: PropTypes.bool,
}

Page.defaultProps = {
  alwaysRender: false,
  showBreadcrumb: true,
  backLink: '',
  title: undefined,
  docTitle: undefined,
  children: undefined,
  applicationTitle: '',
  dispatchApplicationTitle: () => {},
  showPrint: false,
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
