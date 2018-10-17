import React from 'react';
import Dashboard from './Dashboard/index';
import Footer from './Footer/index';
import ErrorComponent from './Error/index';
import SearchContainer from './Search/SearchContainer';
import EstablishmentRollContainer from './EstablishmentRoll/EstablishmentRollContainer';
import Terms from './Footer/terms-and-conditions';
import './App.scss';
import moment from 'moment';

import {
  BrowserRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  resetError,
  setConfig,
  setError,
  setMessage,
  setTermsVisibility,
  setUserDetails,
  switchAgency
} from './redux/actions/index';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';
import ResultsHouseblockContainer from "./ResultsHouseblock/ResultsHouseblockContainer";
import {
  setLoaded,
  setSearchDate,
  setSearchLocation,
  setSearchPeriod,
  setActivityData,
  setSearchActivity,
  setSearchActivities,
  setMenuOpen,
  setCaseChangeRedirectStatus
} from "./redux/actions";
import ResultsActivityContainer from "./ResultsActivity/ResultsActivityContainer";
import GlobalSearchContainer from "./GlobalSearch/GlobalSearchContainer";

import ModalProvider from './ModalProvider/index';
import PaymentReasonContainer from './ModalProvider/PaymentReasonModal/PaymentReasonContainer';
import links from "./links";

const axios = require('axios');
import { Header } from 'new-nomis-shared-components';

class App extends React.Component {
  constructor () {
    super();
    this.switchCaseLoad = this.switchCaseLoad.bind(this);
    this.showTermsAndConditions = this.showTermsAndConditions.bind(this);
    this.hideTermsAndConditions = this.hideTermsAndConditions.bind(this);
    this.clearMessage = this.clearMessage.bind(this);
    this.displayError = this.displayError.bind(this);
    this.handleError = this.handleError.bind(this);
    this.getActivityList = this.getActivityList.bind(this);
    this.getActivityLocations = this.getActivityLocations.bind(this);
    this.raiseAnalyticsEvent = this.raiseAnalyticsEvent.bind(this);
  }

  async componentWillMount () {
    axios.interceptors.response.use((config) => {
      if (config.status === 205) {
        alert("There is a newer version of this website available, click ok to ensure you're using the latest version."); // eslint-disable-line no-alert
        window.location = '/auth/logout';
      }
      return config;
    }, (error) => Promise.reject(error));

    try {
      this.loadUserAndCaseload();

      const config = await axios.get('/api/config');
      links.notmEndpointUrl = config.data.notmEndpointUrl;
      if (config.data.googleAnalyticsId) {
        ReactGA.initialize(config.data.googleAnalyticsId);
      }

      this.props.configDispatch(config.data);
    } catch (error) {
      this.props.setErrorDispatch(error.message);
    }
  }

  async loadUserAndCaseload () {
    const user = await axios.get('/api/me');
    const caseloads = await axios.get('/api/usercaseloads');
    this.props.userDetailsDispatch({ ...user.data, caseLoadOptions: caseloads.data });
  }

  async switchCaseLoad (newCaseload) {
    try {
      this.props.switchAgencyDispatch(newCaseload);
      await axios.put('/api/setactivecaseload', { caseLoadId: newCaseload });
      await this.loadUserAndCaseload();
    } catch (error) {
      this.props.setErrorDispatch(error.message);
    }
  }

  showTermsAndConditions () {
    this.props.setTermsVisibilityDispatch(true);
  }

  hideTermsAndConditions () {
    this.props.setTermsVisibilityDispatch(false);
  }

  clearMessage () {
    this.props.setMessageDispatch(null);
  }

  displayError (error) {
    this.props.setErrorDispatch((error.response && error.response.data) || 'Something went wrong: ' + error);
  }

  handleError (error) {
    if ((error.response && error.response.status === 401) && (error.response.data && error.response.data.reason === 'session-expired')) {
      this.displayAlertAndLogout("Your session has expired, please click OK to be redirected back to the login page");
    } else {
      this.props.setErrorDispatch((error.response && error.response.data) || 'Something went wrong: ' + error);
    }
  }

  displayAlertAndLogout (message) {
    alert(message); // eslint-disable-line no-alert
    window.location = '/auth/logout';
  }

  shouldDisplayInnerContent () {
    return !this.props.shouldShowTerms && (this.props.user && this.props.user.activeCaseLoadId);
  }

  handleLocationChange (event) {
    this.props.locationDispatch(event.target.value);
  }

  handleActivityChange (event) {
    this.props.activityDispatch(event.target.value);
  }

  handleDateChange (date) {
    if (date) {
      this.props.dateDispatch(moment(date).format('DD/MM/YYYY'));
    }
  }

  handleDateChangeWithLocationsUpdate (date) {
    if (date) {
      const formattedDate = moment(date).format('DD/MM/YYYY');
      this.props.dateDispatch(formattedDate);
      this.getActivityLocations(formattedDate, null);
    }
  }

  handlePeriodChange (event) {
    this.props.periodDispatch(event.target.value);
  }

  handlePeriodChangeWithLocationsUpdate (event) {
    this.props.periodDispatch(event.target.value);
    this.getActivityLocations(null, event.target.value);
  }

  handleSearch (history) {
    if (this.props.currentLocation && this.props.currentLocation !== '--') {
      history.push('/whereaboutsresultshouseblock');
    } else if (this.props.activity) {
      if (history.location.pathname === '/whereaboutsresultsactivity') {
        this.getActivityList(this.props.orderField, this.props.sortOrder);
      } else {
        history.push('/whereaboutsresultsactivity');
      }
    }
  }

  raiseAnalyticsEvent (event) {
    if (this.props.config.googleAnalyticsId) {
      ReactGA.event(event);
    }
  }

  async getActivityList () {
    try {
      this.props.resetErrorDispatch();
      this.props.setLoadedDispatch(false);
      let date = this.props.date;
      if (date === 'Today') { // replace placeholder text
        date = moment().format('DD/MM/YYYY');
      }
      const config = {
        params: {
          agencyId: this.props.agencyId,
          locationId: this.props.activity,
          date: date,
          timeSlot: this.props.period
        }
      };
      const response = await axios.get('/api/activitylist', config);
      this.props.activityDataDispatch(response.data);
    } catch (error) {
      this.handleError(error);
    }
    this.props.setLoadedDispatch(true);
  }

  async getActivityLocations (date, period) {
    this.props.setLoadedDispatch(false);
    try {
      if (!date) {
        date = this.props.date;
      }
      if (date === 'Today') { // replace placeholder text
        date = moment().format('DD/MM/YYYY');
      }
      if (!period) {
        period = this.props.period;
      }
      const response = await axios.get('/api/activityLocations', {
        params: {
          agencyId: this.props.agencyId,
          bookedOnDay: date,
          timeSlot: period
        } });
      this.props.activitiesDispatch(response.data);
      // set to unselected
      this.props.activityDispatch('--');
    } catch (error) {
      this.handleError(error);
    }
    this.props.setLoadedDispatch(true);
  }

  async handlePay (activity, browserEvent) {
    try {
      if (!activity.eventId) {
        throw new Error('No event id found for this row');
      }
      // TODO use this to detect whether we are checking or unchecking ?
      // if (browserEvent.???) ...
      const data = {
        eventOutcome: 'ATT',
        performance: 'STANDARD'
      };
      await axios.put(`/api/updateAttendance?offenderNo=${activity.offenderNo}&activityId=${activity.eventId}`, data);
    } catch (error) {
      this.handleError(error);
    }
  }

  render () {
    const routes = (<div className="inner-content" onClick={() => {
      if (this.props.menuOpen) {
        this.props.setMenuOpen(false);
      }
    }}><div className="pure-g">
        <Route path="(/)" render={() => (<Route exact path="/" render={() => (
          <Redirect to="/whereaboutssearch"/>
        )}/>)}/>
        <Route path="(/whereaboutssearch)" render={() => (
          <SearchContainer
            handleError={this.handleError}
            getActivityLocations={this.getActivityLocations}
            handleDateChange={(event) => this.handleDateChangeWithLocationsUpdate(event)}
            handlePeriodChange={(event) => this.handlePeriodChangeWithLocationsUpdate(event)}
            handleSearch={(history) => this.handleSearch(history)}
            {...this.props} />
        )}/>
        <Route path="(/globalsearch)" render={() => (
          <GlobalSearchContainer
            handleError={this.handleError}
            raiseAnalyticsEvent={this.raiseAnalyticsEvent}
            {...this.props} />
        )}/>
        <Route exact path="/whereaboutsresultshouseblock" render={() => (
          <ResultsHouseblockContainer
            handleError={this.handleError}
            handleDateChange={(event) => this.handleDateChange(event)}
            handlePeriodChange={(event) => this.handlePeriodChange(event)}
            raiseAnalyticsEvent={this.raiseAnalyticsEvent}
            handlePay={this.handlePay}
            {...this.props}
          />
        )}/>
        <Route exact path="/whereaboutsresultsactivity" render={() => (
          <ResultsActivityContainer
            handleError={this.handleError}
            getActivityList = {this.getActivityList}
            getActivityLocations={this.getActivityLocations}
            handleDateChange={(event) => this.handleDateChange(event)}
            handlePeriodChange={(event) => this.handlePeriodChange(event)}
            handleSearch={(history) => this.handleSearch(history)}
            raiseAnalyticsEvent={this.raiseAnalyticsEvent}
            handlePay={this.handlePay}
            {...this.props} />
        )}/>
        <Route exact path="/dashboard" render={() => <Dashboard {...this.props} />}/>
        <Route exact path="/establishmentroll" render={() => (
          <EstablishmentRollContainer handleError={this.handleError} {...this.props} />
        )} />
      </div></div>);

    let innerContent;
    if (this.shouldDisplayInnerContent()) {
      innerContent = routes;
    } else {
      innerContent = (<div className="inner-content" onClick={() => this.props.setMenuOpen(false)}><div className="pure-g"><ErrorComponent {...this.props} /></div></div>);
    }

    return (
      <Router>
        <div className="content">
          <Route render={(props) => {
            if (this.props.config && this.props.config.googleAnalyticsId) {
              ReactGA.pageview(props.location.pathname);
            }
            return (<Header
              logoText={'HMPPS'}
              title={'Activity Lists'}
              homeLink={links.getHomeLink()}
              switchCaseLoad={this.switchCaseLoad}
              history={props.history}
              {...this.props}
            />);
          }}
          />
          {this.props.shouldShowTerms && <Terms close={() => this.hideTermsAndConditions()} />}

          <ModalProvider {...this.props} showModal={this.props.showModal}>
            <PaymentReasonContainer key="payment-reason-modal" handleError={this.handleError} />
          </ModalProvider>

          {innerContent}
          <Footer
            setMenuOpen={this.props.setMenuOpen}
            showTermsAndConditions={this.showTermsAndConditions}
            mailTo={this.props.config && this.props.config.mailTo}
          />
        </div>
      </Router>);
  }
}

App.propTypes = {
  activitiesDispatch: PropTypes.func.isRequired,
  activity: PropTypes.string,
  activityDataDispatch: PropTypes.func.isRequired,
  activityDispatch: PropTypes.func.isRequired,
  agencyId: PropTypes.string,
  config: PropTypes.object,
  configDispatch: PropTypes.func.isRequired,
  currentLocation: PropTypes.string,
  currentSubLocation: PropTypes.string,
  date: PropTypes.string,
  dateDispatch: PropTypes.func.isRequired,
  locationDispatch: PropTypes.func.isRequired,
  orderField: PropTypes.string,
  periodDispatch: PropTypes.func.isRequired,
  period: PropTypes.string,
  shouldShowTerms: PropTypes.bool,
  menuOpen: PropTypes.bool,
  resetErrorDispatch: PropTypes.func,
  setErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  setMenuOpen: PropTypes.func.isRequired,
  setMessageDispatch: PropTypes.func.isRequired,
  setTermsVisibilityDispatch: PropTypes.func.isRequired,
  showModal: PropTypes.object.isRequired,
  sortOrder: PropTypes.string,
  switchAgencyDispatch: PropTypes.func.isRequired,
  user: PropTypes.object,
  userDetailsDispatch: PropTypes.func.isRequired,
  setCaseChangeRedirectStatusDispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => {
  return {
    error: state.app.error,
    message: state.app.message,
    page: state.app.page,
    config: state.app.config,
    user: state.app.user,
    shouldShowTerms: state.app.shouldShowTerms,
    currentLocation: state.search.location, // NOTE prop name "location" clashes with history props
    activity: state.search.activity,
    date: state.search.date,
    period: state.search.period,
    agencyId: state.app.user.activeCaseLoadId,
    orderField: state.events.orderField,
    sortOrder: state.events.sortOrder,
    showModal: state.app.showModal,
    menuOpen: state.app.menuOpen,
    caseChangeRedirect: state.app.caseChangeRedirect
  };
};

const mapDispatchToProps = dispatch => {
  return {
    configDispatch: (config) => dispatch(setConfig(config)),
    userDetailsDispatch: (user) => dispatch(setUserDetails(user)),
    switchAgencyDispatch: (agencyId) => dispatch(switchAgency(agencyId)),
    setTermsVisibilityDispatch: (shouldShowTerms) => dispatch(setTermsVisibility(shouldShowTerms)),
    setErrorDispatch: (error) => dispatch(setError(error)),
    resetErrorDispatch: () => dispatch(resetError()),
    setMessageDispatch: (message) => dispatch(setMessage(message)),
    locationDispatch: text => dispatch(setSearchLocation(text)),
    activitiesDispatch: text => dispatch(setSearchActivities(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    dateDispatch: text => dispatch(setSearchDate(text)),
    periodDispatch: text => dispatch(setSearchPeriod(text)),
    activityDataDispatch: data => dispatch(setActivityData(data)),
    setLoadedDispatch: (status) => dispatch(setLoaded(status)),
    setMenuOpen: (flag) => dispatch(setMenuOpen(flag)),
    setCaseChangeRedirectStatusDispatch: (flag) => dispatch(setCaseChangeRedirectStatus(flag))
  };
};


const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export {
  App,
  AppContainer
};
export default App;
