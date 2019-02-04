import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'react-emotion'
import { Link } from 'react-router-dom'
import { FOCUS_WIDTH } from '@govuk-react/constants'
import { FOOTER_LINK, FOOTER_LINK_HOVER, TEXT_COLOUR, FOCUS_COLOUR } from 'govuk-colours'

export const footerLinkStyle = css`
  text-decoration: underline;
  cursor: pointer;

  &:link,
  &:visited {
    color: ${FOOTER_LINK};
  }

  &:hover,
  &:active {
    color: ${FOOTER_LINK_HOVER};
  }

  &:focus {
    color: ${TEXT_COLOUR};
    background-color: ${FOCUS_COLOUR};
    outline: ${FOCUS_WIDTH} solid ${FOCUS_COLOUR};
  }

  &:link:focus {
    ${TEXT_COLOUR};
  }
`

const linkOnClick = handlerFn => {
  if (!handlerFn) return null

  return {
    tabIndex: 0,
    role: 'link',
    onClick: handlerFn,
    onKeyDown: event => {
      if (event.key === 'Enter') handlerFn(event)
    },
  }
}

const FooterLink = ({ href, to, clickHandler, children }) => {
  let LinkComponent = 'a'
  if (to) LinkComponent = Link

  return (
    <LinkComponent href={href} to={to} className={footerLinkStyle} {...linkOnClick(clickHandler)}>
      {children}
    </LinkComponent>
  )
}

FooterLink.propTypes = {
  children: PropTypes.string.isRequired,
  href: PropTypes.string,
  to: PropTypes.string,
  clickHandler: PropTypes.func,
}

FooterLink.defaultProps = {
  href: undefined,
  to: undefined,
  clickHandler: undefined,
}

export default FooterLink
