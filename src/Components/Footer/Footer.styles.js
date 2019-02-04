import styled, { css } from 'react-emotion'
import { SPACING, LINE_HEIGHT, FONT_SIZE, GUTTER_HALF, NTA_LIGHT, BREAKPOINTS, GUTTER } from '@govuk-react/constants'
import { GREY_2, FOOTER_BACKGROUND, FOOTER_TEXT, FOOTER_BORDER_TOP } from 'govuk-colours'
import Header from '@govuk-react/header'
import { RESPONSIVE_4, RESPONSIVE_5, RESPONSIVE_7, RESPONSIVE_8 } from '@govuk-react/constants/lib/spacing'
import crestLogo from './images/govuk-crest.png'
import crestLogo2x from './images/govuk-crest-2x.png'
import { footerLinkStyle } from './elements/FooterLink'

// https://github.com/alphagov/govuk-frontend/blob/master/src/components/footer/_footer.scss

const crestImageWidth2x = 250
const crestImageHeight2x = 204
const crestImageWidth = crestImageWidth2x / 2
const crestImageHeight = crestImageHeight2x / 2

export const StyledFooter = styled('footer')`
  display: flex;
  justify-content: center;
  padding-top: ${RESPONSIVE_7.mobile}px;
  padding-bottom: ${RESPONSIVE_5.mobile}px;
  font-family: ${NTA_LIGHT};
  font-size: ${FONT_SIZE.SIZE_14};
  line-height: ${LINE_HEIGHT.SIZE_14};
  @media screen and (min-width: ${BREAKPOINTS.TABLET}) {
    padding-top: ${RESPONSIVE_7.tablet}px;
    padding-bottom: 25px;
    font-size: ${FONT_SIZE.SIZE_16};
    line-height: ${LINE_HEIGHT.SIZE_16};
  }

  border-top: 1px solid ${FOOTER_BORDER_TOP};
  color: ${FOOTER_TEXT};
  background: ${FOOTER_BACKGROUND};
`

export const StyledContainer = styled('div')`
  width: 100%;
  max-width: 1170px; /* Bespoke to NN - Would ordinarily be SITE_WIDTH_PX */
  margin: 0 ${SPACING.SCALE_3};

  @media screen and (min-width: ${BREAKPOINTS.TABLET}) {
    margin: 0 ${SPACING.SCALE_5};
  }
`

export const StyledSectionBreak = styled('hr')`
  margin: 0;
  margin-bottom: ${RESPONSIVE_8.mobile}px;
  border: 0;
  border-bottom: 1px solid ${GREY_2};

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    margin-bottom: ${RESPONSIVE_8.tablet}px;
  }
`

export const StyledMeta = styled('div')`
  display: flex;
  margin-right: -${GUTTER_HALF};
  margin-left: -${GUTTER_HALF};
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
`

const flexBasisPartial = props =>
  props.grow &&
  css`
    @media screen and (max-width: ${BREAKPOINTS.DESKTOP}) {
      flex-basis: 320px;
    }
  `
export const StyledMetaItem = styled('div')`
  margin-right: ${GUTTER_HALF};
  margin-bottom: 25px;
  margin-left: ${GUTTER_HALF};
  flex: ${props => (props.grow ? 1 : undefined)};
  ${flexBasisPartial};
`

export const StyledMetaCustom = styled('div')`
  margin-bottom: ${SPACING.SCALE_4};
`

// .govuk-visually-hidden
export const StyledHiddenHeader = styled(Header)`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
`

export const StyledInlineList = styled('div')`
  margin-top: 0;
  margin-bottom: ${SPACING.SCALE_3};
  padding: 0;

  li {
    display: inline-block;
    margin-right: ${SPACING.SCALE_3};
    margin-bottom: ${SPACING.SCALE_1};
  }
`

export const StyledSectionHeading = styled(Header)`
  border-bottom: 1px solid ${GREY_2};
  padding-bottom: ${SPACING.SCALE_2};
  margin-bottom: ${RESPONSIVE_7.mobile}px;

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    padding-bottom: ${SPACING.SCALE_4};
    margin-bottom: ${RESPONSIVE_7.tablet}px;
  }
`

export const StyledNavigation = styled('div')`
  display: flex;
  margin-right: -${GUTTER_HALF};
  margin-left: -${GUTTER_HALF};
  flex-wrap: wrap;
`

export const StyledSection = styled('div')`
  display: inline-block;
  margin-right: ${GUTTER_HALF};
  margin-bottom: ${GUTTER};
  margin-left: ${GUTTER_HALF};
  vertical-align: top;

  /* Ensure columns take up equal width (typically one-half:one-half) */
  flex-grow: 1;
  flex-shrink: 1;

  /* Make sure columns do not drop below 200px in width
      Will typically result in wrapping, and end up in a single column on smaller screens. */
  flex-basis: 200px;

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    flex-basis: auto;

    &:first-child {
      flex-grow: 2;
    }
  }
`

export const StyledFooterList = styled('ul')`
  margin: 0;
  padding: 0;
  list-style: none;
  column-gap: ${GUTTER};

  @media screen and (min-width: ${BREAKPOINTS.DESKTOP}) {
    /* 2 or 3 columns only */
    column-count: ${props => (props.columns ? props.columns : undefined)};
  }

  li {
    margin-bottom: ${RESPONSIVE_4.mobile}px;

    @media screen and (min-width: ${BREAKPOINTS.TABLET}) {
      margin-bottom: ${RESPONSIVE_4.tablet}px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`

export const StyledLicenseLogo = styled('svg')`
  display: inline-block;
  margin-right: ${SPACING.SCALE_2};
  vertical-align: top;

  @media screen and (max-width: ${BREAKPOINTS.DESKTOP}) {
    margin-bottom: ${SPACING.SCALE_3};
  }
`

export const StyledLicenseDescription = styled('span')`
  display: inline-block;
`

export const StyledCopyrightLogo = styled('a')`
  ${footerLinkStyle} display: inline-block;
  min-width: ${crestImageWidth}px;
  padding-top: ${crestImageHeight + 10}px;
  background-image: url(${crestLogo});
  @media only screen and (-webkit-min-device-pixel-ratio: 2),
    not all,
    not all,
    only screen and (min-resolution: 192dpi),
    only screen and (min-resolution: 2dppx) {
    background-image: url(${crestLogo2x});
  }
  background-repeat: no-repeat;
  background-position: 50% 0%;
  background-size: ${crestImageWidth}px ${crestImageHeight}px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
`
