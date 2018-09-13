import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropdown from '../Dropdown';
import { getHomeLink } from "../links";

import './header.theme.scss';

class Header extends Component {
  render () {
    return (
      <header className="page-header">
        <div className="header-content clickable">
          <div className="left-content">
            <a title="Home link" className="link" href={getHomeLink()}>
              <div className="logo"><img src="/images/Crest@2x.png" alt="" width="42" height="35"/></div>
            </a>
            <a title="Home link" className="unstyled-link" href={getHomeLink()}>
              <span className="logo-text">HMPPS</span>
              <span className="title">Activity Lists</span>
            </a>
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
