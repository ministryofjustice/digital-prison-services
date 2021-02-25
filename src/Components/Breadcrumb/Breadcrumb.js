import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import { BreadcrumbContainer, BreadcrumbList, BreadcrumbListItem } from './Breadcrumb.styles'
import routes from '../../routes'

export const Breadcrumb = ({ breadcrumbs, homeLink }) => {
  const breadcrumbTrail = breadcrumbs.splice(0, breadcrumbs.length - 1)

  return (
    <BreadcrumbContainer data-qa="breadcrumb">
      <BreadcrumbList>
        <BreadcrumbListItem>
          <a data-qa="breadcrumb-home-page-link" href={homeLink}>
            Digital Prison Services
          </a>
        </BreadcrumbListItem>
        {breadcrumbTrail.map(({ match, breadcrumb }, i, arr) => {
          const parentPageLink = arr.length - 1 === i ? 'breadcrumb-parent-page-link' : null

          return (
            <BreadcrumbListItem key={match.url}>
              <Link to={match.url} data-qa={parentPageLink}>
                {breadcrumb}
              </Link>
            </BreadcrumbListItem>
          )
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  )
}

Breadcrumb.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
  homeLink: PropTypes.string.isRequired,
}

export default withBreadcrumbs(routes)(Breadcrumb)
