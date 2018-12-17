import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import links from '../../links'
import { BreadcrumbContainer, BreadcrumbList, BreadcrumbListItem } from './Breadcrumb.styles'
import { routeMatchType } from '../../types'
import routes from '../../routes'

export const Breadcrumb = ({ breadcrumbs, match }) => (
  <BreadcrumbContainer>
    <BreadcrumbList>
      <BreadcrumbListItem>
        <a data-qa="breadcrumb-home-page-link" href={links.getHomeLink()}>
          Home
        </a>
      </BreadcrumbListItem>
      {breadcrumbs.map((breadcrumb, i, arr) => {
        const parentPageLink = arr.length - 2 === i ? 'breadcrumb-parent-page-link' : null
        return (
          <BreadcrumbListItem key={breadcrumb.key}>
            {match.url !== breadcrumb.props.match.url && (
              <Link to={breadcrumb.props.match.url} data-qa={parentPageLink}>
                {breadcrumb}
              </Link>
            )}
            {match.url === breadcrumb.props.match.url && breadcrumb}
          </BreadcrumbListItem>
        )
      })}
    </BreadcrumbList>
  </BreadcrumbContainer>
)

Breadcrumb.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: routeMatchType.isRequired,
}

export default withBreadcrumbs(routes)(Breadcrumb)
