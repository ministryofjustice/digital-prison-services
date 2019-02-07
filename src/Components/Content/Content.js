import React from 'react'
import { connect } from 'react-redux'
// import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { documentToReactComponent } from '@shinetools/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import Header from '@govuk-react/header'
import Page from '../Page'

const options = {
  // renderMark: {
  //   [MARKS.BOLD]: text => `<custom-bold>${text}<custom-bold>`
  // },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, next) => (
      <Header level={2} size="MEDIUM">
        {next(node.content)}
      </Header>
    ),
  },
}

const Content = ({ content, match }) => {
  const blogPost = content.filter(post => post.fields.path === match.params.post)
  console.log('blogPost', blogPost)
  return (
    <Page title={blogPost[0].fields.title}>
      {documentToReactComponent(blogPost[0].fields.body, options)}
    </Page>
  )
}

const mapStateToProps = state => ({
  content: state.app.content,
})

export default connect(mapStateToProps)(Content)
