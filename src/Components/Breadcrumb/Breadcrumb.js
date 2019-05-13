import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { BreadcrumbContainer, BreadcrumbList, BreadcrumbListItem } from './Breadcrumb.styles'
import routes from '../../routes'

export const Breadcrumb = ({ breadcrumbs, homeLink }) => {
  // Pick (pop) the last breadcrumb from the array (also removes it from the array)
  const { breadcrumb: poppedBreadcrumb } = breadcrumbs.length > 0 ? breadcrumbs.pop() : breadcrumbs

  return (
    <BreadcrumbContainer data-qa="breadcrumb">
      <BreadcrumbList>
        <BreadcrumbListItem>
          <a data-qa="breadcrumb-home-page-link" href={homeLink}>
            Home
          </a>
        </BreadcrumbListItem>
        {breadcrumbs.map(({ match, breadcrumb }, i, arr) => {
          const parentPageLink = arr.length - 1 === i ? 'breadcrumb-parent-page-link' : null
          if (breadcrumb.props.renderDirectly) {
            return <BreadcrumbListItem key={match.url}>{breadcrumb}</BreadcrumbListItem>
          }
          return (
            <BreadcrumbListItem key={match.url}>
              <Link to={match.url} data-qa={parentPageLink}>
                {breadcrumb}
              </Link>
            </BreadcrumbListItem>
          )
        })}
        <BreadcrumbListItem>{poppedBreadcrumb}</BreadcrumbListItem>
      </BreadcrumbList>
    </BreadcrumbContainer>
  )
}

Breadcrumb.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  homeLink: PropTypes.string.isRequired,
}

export default withBreadcrumbs(routes)(Breadcrumb)
