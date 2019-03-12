import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Header from '@govuk-react/heading'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Page from '../Page'
import { fetchContent, setApplicationTitle } from '../../redux/actions'
import { routeMatchType } from '../../types'
import { StyledList, StyledListItem } from './Content.styles'

const options = {
  renderMark: {
    [MARKS.BOLD]: text => <strong>{text}</strong>,
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, children) => (
      <Header level={2} size="MEDIUM">
        {children}
      </Header>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <Header level={3} size="SMALL">
        {children}
      </Header>
    ),
    [BLOCKS.UL_LIST]: (node, children) => <StyledList>{children}</StyledList>,
    [BLOCKS.LIST_ITEM]: (node, children) => <StyledListItem>{children}</StyledListItem>,
    [INLINES.HYPERLINK]: (node, children) => (
      // Update to @govuk-react/link when out of Alpha
      <a className="link" href={node.data.uri}>
        {children}
      </a>
    ),
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
    const { dispatch } = this.props

    dispatch(setApplicationTitle('Digital Prison Services'))
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
          <GridCol columnTwoThirds>{pageContent && documentToReactComponents(pageContent.body, options)}</GridCol>
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
