/* eslint-disable */
import React, { Component } from 'react'
import Header from '@govuk-react/header'
import { documentToReactComponent } from '@shinetools/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Page from '../Page'
import { fetchContent } from '../../redux/actions'
import withLoading from '../Loading'

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
  constructor(props) {
    super(props)
    this.state = {
      pageContent: undefined,
    }
  }

  componentDidMount() {
    this.setContent()
  }

  componentDidUpdate(nextProps) {
    const { match, content } = this.props
    const urlUpdated = nextProps.match.url !== match.url
    const contentUpdated = nextProps.content !== content

    if (urlUpdated || contentUpdated) {
      this.setContent()
    }
  }

  setContent() {
    const { match, content, fetchContentDispatch } = this.props
    const preLoadedContent = content.find(obj => obj.path === match.params.post)

    if (preLoadedContent) this.setState({ pageContent: preLoadedContent })
    else fetchContentDispatch(match.params.post)
  }

  render() {
    const { pageContent } = this.state

    console.log('this.state', this.state)

    return (
      <Page title={pageContent && pageContent.title}>
        <React.Fragment>{pageContent && documentToReactComponent(pageContent.body, options)}</React.Fragment>
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
)(Content)
