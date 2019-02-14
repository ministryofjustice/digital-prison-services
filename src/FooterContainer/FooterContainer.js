import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Footer } from 'new-nomis-shared-components'
import { fetchContentLinks } from '../redux/actions/index'

class FooterContainer extends Component {
  componentDidMount() {
    const { dispatch } = this.props

    dispatch(fetchContentLinks())
  }

  getLinksFromCategory = links => {
    if (links)
      return links.map(item => ({
        href: `/content/${item.fields.path}`,
        text: item.fields.title,
        target: '_blank',
      }))

    return []
  }

  render() {
    const { contentLinks, feedbackEmail } = this.props
    const footerNavigationLinks =
      contentLinks.size > 0 ? this.getLinksFromCategory(contentLinks.get('FooterNavigation')) : []
    const footerMetaLinks = [
      { text: 'Contact', href: `mailto:${feedbackEmail}` },
      ...(contentLinks.size > 0 ? this.getLinksFromCategory(contentLinks.get('FooterMeta')) : []),
    ]

    return (
      <Footer
        meta={{
          items: footerMetaLinks,
        }}
        navigation={
          footerNavigationLinks.length > 0
            ? [
                {
                  title: 'Useful links',
                  items: footerNavigationLinks,
                },
              ]
            : undefined
        }
      />
    )
  }
}

FooterContainer.propTypes = {
  contentLinks: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  dispatch: PropTypes.func.isRequired,
  feedbackEmail: PropTypes.string.isRequired,
}

FooterContainer.defaultProps = {
  contentLinks: [],
}

const mapStateToProps = state => ({
  contentLinks: state.content.links,
})

export default connect(mapStateToProps)(FooterContainer)
