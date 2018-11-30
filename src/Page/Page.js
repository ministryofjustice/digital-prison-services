import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Header from '@govuk-react/header'
import Error from '../Error'
import Spinner from '../Spinner'
import { Container, Breadcrumbs } from './Page.styles'
import links from '../links'

export const Page = ({ error, loaded, title, children }) => {
  if (error) return <Error error={error} />

  if (loaded) {
    return (
      <Fragment>
        <Breadcrumbs>
          <a id="back_to_menu_link" title="Back to home link" className="link backlink" href={links.getHomeLink()}>
            <img className="back-triangle" src="/images/BackTriangle.png" alt="" width="6" height="10" /> Back
          </a>
        </Breadcrumbs>
        <Container>
          <Header level={1} size="LARGE">
            {title}
          </Header>
          <div className="page-content">{children}</div>
        </Container>
      </Fragment>
    )
  }

  return <Spinner />
}

Page.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]).isRequired,
  loaded: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
}

const mapStateToProps = state => ({
  error: state.app.error,
  loaded: state.app.loaded,
})

export default connect(mapStateToProps)(Page)
