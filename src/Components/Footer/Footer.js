import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  StyledFooter,
  StyledContainer,
  StyledMeta,
  StyledMetaItem,
  StyledMetaCustom,
  StyledInlineList,
  StyledLicenseDescription,
  StyledLicenseLogo,
  StyledCopyrightLogo,
  StyledHiddenHeader,
  StyledNavigation,
  StyledSection,
  StyledSectionBreak,
  StyledFooterList,
  StyledSectionHeading,
} from './Footer.styles'

import FooterLink from './elements/FooterLink'

const hyphenateString = str => str.replace(/ +/g, '-').toLowerCase()

// https://github.com/alphagov/govuk-frontend/blob/master/src/components/footer/template.njk
const Footer = ({ navigation, meta, children }) => (
  <StyledFooter role="contentinfo">
    <StyledContainer>
      {navigation &&
        navigation.length > 0 && (
          <Fragment>
            <StyledNavigation>
              {navigation.map(section => (
                <StyledSection key={hyphenateString(section.title)}>
                  <StyledSectionHeading level={2} size="MEDIUM">
                    {section.title}
                  </StyledSectionHeading>
                  {section.items &&
                    section.items.length > 0 && (
                      <StyledFooterList columns={section.columns}>
                        {section.items.map(item => (
                          <li key={hyphenateString(item.text)}>
                            <FooterLink href={item.href}>{item.text}</FooterLink>
                          </li>
                        ))}
                      </StyledFooterList>
                    )}
                </StyledSection>
              ))}
            </StyledNavigation>
            <StyledSectionBreak />
          </Fragment>
        )}

      <StyledMeta>
        <StyledMetaItem grow>
          {meta &&
            meta.items &&
            meta.items.length > 0 && (
              <Fragment>
                <StyledHiddenHeader level={2}>Support links</StyledHiddenHeader>
                <StyledInlineList>
                  {meta.items.map(item => (
                    <li key={hyphenateString(item.text)}>
                      <FooterLink href={item.href} {...item}>
                        {item.text}
                      </FooterLink>
                    </li>
                  ))}
                </StyledInlineList>
              </Fragment>
            )}
          {children && <StyledMetaCustom>{children}</StyledMetaCustom>}
          <StyledLicenseLogo
            role="presentation"
            focusable="false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 483.2 195.7"
            height="17"
            width="41"
          >
            <path
              fill="currentColor"
              d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
            />
          </StyledLicenseLogo>
          <StyledLicenseDescription>
            All content is available under the{' '}
            <FooterLink href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">
              Open Government Licence v3.0
            </FooterLink>
            , except where otherwise stated
          </StyledLicenseDescription>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledCopyrightLogo href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/">
            © Crown copyright
          </StyledCopyrightLogo>
        </StyledMetaItem>
      </StyledMeta>
    </StyledContainer>
  </StyledFooter>
)

Footer.propTypes = {
  navigation: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      columns: PropTypes.number,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          href: PropTypes.string,
          text: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  meta: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        href: PropTypes.string,
        text: PropTypes.string.isRequired,
      })
    ),
  }),
  children: PropTypes.node,
}

Footer.defaultProps = {
  navigation: [],
  meta: null,
  children: null,
}

Footer.Link = FooterLink

export default Footer
