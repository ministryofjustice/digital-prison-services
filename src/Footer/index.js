import React from 'react';
import PropTypes from 'prop-types';

import './footer.scss';

const Footer = (props) =>
  (<footer className="FooterContainer">
    <div className="footer-content">
      <div className="FooterLinksContainer">
        <div className="FooterLink" onClick={() => props.showTermsAndConditions()}>Terms and conditions</div>
        <div className="FooterLink">Email&nbsp;&nbsp;<a className="link" href={"mailto:" + props.mailTo}>{props.mailTo}</a></div>
      </div>
    </div>
  </footer>);

Footer.propTypes = {
  showTermsAndConditions: PropTypes.func.isRequired,
  mailTo: PropTypes.string
};

Footer.defaultProps = {};

export default Footer;
