import styled from 'styled-components'
import { BLACK, GREY_1, YELLOW } from 'govuk-colours'
import { FONT_SIZE, LINE_HEIGHT, MEDIA_QUERIES, NTA_LIGHT, SPACING } from '@govuk-react/constants'

export const BreadcrumbContainer = styled('div')({
  fontFamily: NTA_LIGHT,
  fontSize: FONT_SIZE.SIZE_14,
  lineHeight: LINE_HEIGHT.SIZE_14,
  [MEDIA_QUERIES.LARGESCREEN]: {
    fontSize: FONT_SIZE.SIZE_16,
    lineHeight: LINE_HEIGHT.SIZE_16,
  },
  marginTop: SPACING.SCALE_3,
  WebkitFontSmoothing: 'antialiased',
  [MEDIA_QUERIES.PRINT]: {
    display: 'none',
  },
})

export const BreadcrumbList = styled('ul')({
  margin: 0,
  padding: 0,
  listStyleType: 'none',
  display: 'block',
})

const BreadcrumbListItem = styled('li')({
  position: 'relative',
  display: 'inline-block',
  whiteSpace: 'no-wrap',
  marginBottom: SPACING.SCALE_1,
  marginLeft: SPACING.SCALE_2,
  paddingLeft: SPACING.SCALE_3,
  ':first-child': {
    marginLeft: 0,
    paddingLeft: 0,
    '::before': {
      display: 'none',
    },
  },
  '::before': {
    content: "''",
    display: 'block',
    position: 'absolute',
    top: '-1px',
    bottom: '1px',
    left: '-3.31px',
    width: '7px',
    height: '7px',
    margin: 'auto 0',
    transform: 'rotate(45deg)',
    border: 'solid',
    borderWidth: '1px 1px 0 0',
    borderColor: `${GREY_1}`,
  },
  '> a': {
    color: `${BLACK}`,
    textDecoration: 'underline',
    ':focus': {
      backgroundColor: `${YELLOW}`,
      outline: `3px solid ${YELLOW}`,
    },
  },
})

BreadcrumbListItem.displayName = 'BreadcrumbItem'

export { BreadcrumbListItem }
