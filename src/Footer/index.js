import React from 'react'
import PropTypes from 'prop-types'
import { linkOnClick } from '../helpers'
import './footer.scss'

const Footer = ({ showTermsAndConditions, mailTo, setMenuOpen }) => (
  // eslint-disable-next-line
  <footer className="FooterContainer" onClick={() => setMenuOpen(false)}>
    <div className="footer-content">
      <div className="FooterLinksContainer">
        <div className="FooterLink">
          <a {...linkOnClick(showTermsAndConditions)}>Terms and conditions</a>
        </div>
        <div className="FooterLink">
          <a href={`mailto:${mailTo}`}>
            Contact us:&nbsp;&nbsp;
            {mailTo}
          </a>
        </div>
      </div>
    </div>
  </footer>
)

Footer.propTypes = {
  showTermsAndConditions: PropTypes.func.isRequired,
  mailTo: PropTypes.string,
  setMenuOpen: PropTypes.func.isRequired,
}

Footer.defaultProps = {
  mailTo: '',
}

export default Footer
