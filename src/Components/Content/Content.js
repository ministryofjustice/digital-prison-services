import React, { Component } from 'react'
import Header from '@govuk-react/header'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { documentToReactComponent } from '@shinetools/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Page from '../Page'
import { fetchContent } from '../../redux/actions'
import { routeMatchType } from '../../types'

// TODO:
// Probably switch to markdown as unsure about rich-text-react-renderer at the moment as it's in beta

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
    const urlUpdated = match.url !== nextProps.match.url
    const contentUpdated = content !== nextProps.content

    if (urlUpdated || contentUpdated) this.setContent()
  }

  setContent() {
    const { match, content, dispatch } = this.props
    const preLoadedContent = content.find(obj => obj.path === match.params.post)

    if (preLoadedContent) return this.setState({ pageContent: preLoadedContent })

    return dispatch(fetchContent(match.params.post))
  }

  render() {
    const { pageContent } = this.state

    return (
      <Page title={pageContent && pageContent.title}>
        <GridRow>
          <GridCol columnTwoThirds>{pageContent && documentToReactComponent(pageContent.body, options)}</GridCol>
        </GridRow>
      </Page>
    )
  }
}

Content.propTypes = {
  content: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, body: PropTypes.object })).isRequired,
  dispatch: PropTypes.func.isRequired,
  match: routeMatchType.isRequired,
}

const mapStateToProps = state => ({
  content: state.content.entries,
})

export default connect(mapStateToProps)(Content)
