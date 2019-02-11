/* eslint-disable */
import React, { Component } from 'react'
import Header from '@govuk-react/header'
import { documentToReactComponent } from '@shinetools/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Page from '../Page'
import { fetchContent } from '../../redux/actions'
import withLoading from '../Loading';

// TODO:
// Probably switch to markdown as unsure about rich-text-react-renderer at the moment as it's in beta
// Manage how and when the content is loaded, component didmount etc
// Look at reducers and set their own loading, success, error state etc, rather than relying on app wide state

const options = {
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) => (
      <Header level={2} size="MEDIUM">
        {next(node.content)}
      </Header>
    ),
    [BLOCKS.UL_LIST]: (node, next) => <ul className="list list-bullet">{next(node.content)}</ul>,
  },
}

class Content extends Component {
  componentDidMount() {}

  getPageContent = () => {
    const { match, content, fetchContentDispatch } = this.props
    const pageContent = content.find(obj => obj.path === match.params.post)

    if (!pageContent) fetchContentDispatch(match.params.post)

    return pageContent
  }

  render() {
    const pageContent = this.getPageContent()
    
    return (
      <Page title={pageContent && pageContent.title}>
        {pageContent && documentToReactComponent(pageContent.body, options)}
      </Page>
    )
  }
}

Content.propTypes = {
  fetchContentDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  content: state.content.entries,
  loading: state.content.loading,
})

const mapDispatchToProps = dispatch => ({
  fetchContentDispatch: path => dispatch(fetchContent(path)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoading(Content))
