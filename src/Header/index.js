import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropdown from '../Dropdown';
import { Link } from "react-router-dom";

import './header.theme.scss';
import './index.scss';

class Header extends Component {
  render () {
    return (
      <header className="page-header">
        <div className="header-content">
          <div className="left-content">
            <Link id="header_logo_keyworker_management_link" title="Key worker management link" className="link" to="/" >
              <div className="logo header-image" />
            </Link>
            <Link id="header_logo_text_keyworker_management_link" title="Key worker management link" className="unstyled-link" to="/" >
              <span className="logo-text">HMPPS</span>
              <span className="title">Prison Staff Hub</span>
            </Link>
          </div>
          <div className="right-content">
            <div className="right-menu">
              {this.props.user && this.props.user.activeCaseLoadId && <Dropdown {...this.props} /> }
            </div>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object.isRequired,
  switchCaseLoad: PropTypes.func.isRequired
};

export default Header;
