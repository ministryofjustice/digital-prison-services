import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Page from '../Page'
import { fetchContent } from '../../redux/actions'

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

    return <Page title={pageContent && pageContent.title}>{pageContent && pageContent.title}</Page>
  }
}

Content.propTypes = {
  fetchContentDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  content: state.app.content,
})

const mapDispatchToProps = dispatch => ({
  fetchContentDispatch: path => dispatch(fetchContent(path)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Content)
