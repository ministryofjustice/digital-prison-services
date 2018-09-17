import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getPrisonDescription, toFullName } from '../utils';

import './theme.scss';

class Dropdown extends Component {
  render () {
    const { user, switchCaseLoad, history, menuOpen, setMenuOpen } = this.props;
    const caseLoadDesc = getPrisonDescription(user);

    return (
      <div className="menu-wrapper" >
        <div id="info-wrapper" className="info-wrapper clickable" onClick={() => setMenuOpen(!menuOpen)}>
          <strong className="user-name">{toFullName(user)}</strong>
          <span className="case-load">{caseLoadDesc}</span>
        </div>
        <div className="dropdown-menu">
          { menuOpen &&
          <div>
            {user.caseLoadOptions.map((option) =>
              (<a className="dropdown-menu-option" id={`menu-option-${option.caseLoadId}`} key={option.caseLoadId} onClick={() => {
                setMenuOpen(false);
                switchCaseLoad(option.caseLoadId);
                history.push("/");
              }}>
                {option.description}
              </a>))
            }
            <a className="dropdown-menu-link" key={'logout'} href={'/auth/logout'}>
              Log out
            </a>
          </div> }
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  user: PropTypes.object,
  switchCaseLoad: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  menuOpen: PropTypes.bool,
  setMenuOpen: PropTypes.func.isRequired
};

Dropdown.defaultProps = {
  user: {
    firstName: 'first',
    activeCaseLoadId: 'id',
    isOpen: false
  },
  menuOpen: false
};

/*const mapStateToProps = state => {
  return {
    isOpen: state.app.isOpen
  };
};*/

//const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login);

export default Dropdown;
