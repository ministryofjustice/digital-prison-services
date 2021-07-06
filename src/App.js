import React from 'react'
import moment from 'moment'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Notifications from 'react-notify-toast'
import ReactGA from 'react-ga'
import { FooterContainer } from 'new-nomis-shared-components'
import ErrorComponent from './Error/index'
import Terms from './Footer/terms-and-conditions'
import './App.scss'
import ScrollToTop from './Components/ScrollToTop'
import Header from './Header/Header'
import ResultsHouseblockContainer from './ResultsHouseblock/ResultsHouseblockContainer'
import ResultsActivityContainer from './ResultsActivity/ResultsActivityContainer'

import routePaths from './routePaths'
import { setFlagsAction } from './flags'
import ModalContainer from './Components/ModalContainer'
import { userType } from './types'
import IncentiveLevelSlipContainer from './IncentiveLevelSlipContainer'
import PrisonersUnaccountedForContainer from './PrisonersUnaccountedFor/PrisonersUnaccountedForContainer'
import FeedbackBanner from './Components/FeedbackBanner/FeedbackBanner'

import {
  getAbsentReasons,
  resetError,
  setActivityOffenderAttendance,
  setConfig,
  setError,
  setLoaded,
  setMenuOpen,
  setSearchActivities,
  setSearchActivity,
  setSearchDate,
  setSearchPeriod,
  setShowModal,
  setTermsVisibility,
  setUserDetails,
} from './redux/actions/index'

const axios = require('axios')

class App extends React.Component {
  async componentWillMount() {
    const { configDispatch, setErrorDispatch } = this.props

    axios.interceptors.response.use(
      (config) => {
        if (config.status === 205) {
          // eslint-disable-next-line no-alert
          alert(
            "There is a newer version of this website available, click ok to ensure you're using the latest version."
          )
          window.location = '/auth/logout'
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    try {
      const [config] = await Promise.all([axios.get('/api/config'), this.loadUserAndCaseload()])

      if (config.data.googleAnalyticsId) {
        ReactGA.initialize(config.data.googleAnalyticsId)
      }

      configDispatch(config.data)
    } catch (error) {
      setErrorDispatch(error.message)
    }
  }

  componentDidUpdate() {
    const { config } = this.props
    this.updateFeatureFlags(config.flags)
  }

  updateFeatureFlags = (flags) => {
    const { setFlagsDispatch } = this.props
    const featureFlags = {
      ...flags,
    }

    setFlagsDispatch(featureFlags)
  }

  getActivityLocations = async (day, time) => {
    let bookedOnDay = day
    let timeSlot = time
    const { agencyId, date, period, setLoadedDispatch, activitiesDispatch, activityDispatch } = this.props

    setLoadedDispatch(false)
    try {
      if (!bookedOnDay) {
        bookedOnDay = date
      }
      if (bookedOnDay === 'Today') {
        // replace placeholder text
        bookedOnDay = moment().format('DD/MM/YYYY')
      }
      if (!timeSlot) {
        timeSlot = period
      }
      const response = await axios.get('/api/activityLocations', {
        params: {
          agencyId,
          bookedOnDay,
          timeSlot,
        },
      })
      if (response.data.error)
        return this.handleError(new Error('this page cannot be loaded. You can try to refresh your browser.'))

      activitiesDispatch(response.data)
      // set to unselected
      activityDispatch('--')
    } catch (error) {
      this.handleError(error)
    }
    return setLoadedDispatch(true)
  }

  handlePeriodChange = (event) => {
    const { periodDispatch } = this.props

    periodDispatch(event.target.value)
  }

  handlePeriodChangeWithLocationsUpdate = (event) => {
    const { periodDispatch } = this.props

    periodDispatch(event.target.value)
    this.getActivityLocations(null, event.target.value)
  }

  raiseAnalyticsEvent = (event) => {
    const { config } = this.props
    if (event && config.googleAnalyticsId) {
      ReactGA.event(event)
    }
  }

  displayAlertAndLogout = (message) => {
    alert(message) // eslint-disable-line no-alert
    window.location = '/auth/logout'
  }

  shouldDisplayInnerContent = () => {
    const { shouldShowTerms, user } = this.props

    // only show inner content if the user has been loaded
    return !shouldShowTerms && user && user.username
  }

  handleDateChange = (date) => {
    const { dateDispatch } = this.props

    if (date) dateDispatch(date)
  }

  handleDateChangeWithLocationsUpdate = (date) => {
    const { dateDispatch } = this.props

    if (date) {
      const formattedDate = moment(date).format('DD/MM/YYYY')
      dateDispatch(formattedDate)
      this.getActivityLocations(formattedDate, null)
    }
  }

  handleError = (error) => {
    const { setErrorDispatch } = this.props
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.reason === 'session-expired'
    ) {
      this.displayAlertAndLogout('Your session has expired, please click OK to be redirected back to the login page')
    } else {
      window.scrollTo(0, 0)
      setErrorDispatch((error.response && error.response.data) || `Something went wrong: ${error}`)
    }
  }

  hideTermsAndConditions = () => {
    const { setTermsVisibilityDispatch } = this.props

    setTermsVisibilityDispatch(false)
  }

  showTermsAndConditions = () => {
    const { setTermsVisibilityDispatch } = this.props

    setTermsVisibilityDispatch(true)
  }

  loadUserAndCaseload = async () => {
    const { userDetailsDispatch } = this.props
    const [user, caseloads, roles] = await Promise.all([
      axios.get('/api/me'),
      axios.get('/api/usercaseloads'),
      axios.get('/api/userroles'),
    ])

    const activeCaseLoad = caseloads.data.find((cl) => cl.currentlyActive)
    const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

    userDetailsDispatch({ ...user.data, activeCaseLoadId, caseLoadOptions: caseloads.data, roles: roles.data })
  }

  render() {
    const {
      config,
      menuOpen,
      boundSetMenuOpen,
      shouldShowTerms,
      setLoadedDispatch,
      resetErrorDispatch,
      setErrorDispatch,
      error,
      user,
      modalActive,
      modalContent,
      setShowModalDispatch,
      getAbsentReasonsDispatch,
      setOffenderPaymentDataDispatch,
    } = this.props

    const routes = (
      // eslint-disable-next-line
      <div
        className="inner-content"
        onClick={() => {
          if (menuOpen) {
            boundSetMenuOpen(false)
          }
        }}
      >
        <div className="pure-g">
          <Route
            exact
            path="/manage-prisoner-whereabouts/housing-block-results"
            render={() => (
              <ResultsHouseblockContainer
                handleError={this.handleError}
                handleDateChange={(event) => this.handleDateChange(event)}
                handlePeriodChange={(event) => this.handlePeriodChange(event)}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                showModal={setShowModalDispatch}
              />
            )}
          />
          <Route
            exact
            path="/manage-prisoner-whereabouts/activity-results"
            render={() => (
              <ResultsActivityContainer
                handleError={this.handleError}
                handleDateChange={(event) => this.handleDateChange(event)}
                handlePeriodChange={(event) => this.handlePeriodChange(event)}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                showModal={setShowModalDispatch}
              />
            )}
          />

          <Route
            exact
            path={routePaths.prisonersUnaccountedFor}
            render={({ history }) => (
              <PrisonersUnaccountedForContainer
                handleDateChange={(event) => this.handleDateChange(event)}
                handlePeriodChange={(event) => this.handlePeriodChange(event)}
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                setErrorDispatch={setErrorDispatch}
                resetErrorDispatch={resetErrorDispatch}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                showModal={setShowModalDispatch}
                setOffenderPaymentDataDispatch={setOffenderPaymentDataDispatch}
                getAbsentReasonsDispatch={getAbsentReasonsDispatch}
                history={history}
              />
            )}
          />
        </div>
      </div>
    )

    let innerContent
    if (this.shouldDisplayInnerContent()) {
      innerContent = routes
    } else {
      innerContent = (
        // eslint-disable-next-line
        <div className="inner-content" onClick={() => boundSetMenuOpen(false)}>
          <div className="pure-g">
            <ErrorComponent error={error} />
          </div>
        </div>
      )
    }

    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/iep-slip"
            render={({ location }) => {
              if (config && config.googleAnalyticsId) {
                ReactGA.pageview(location.pathname)
              }
              return <IncentiveLevelSlipContainer />
            }}
          />
          <Route
            render={() => (
              <div className="content">
                <ScrollToTop>
                  <Notifications />
                  <Route
                    render={({ location }) => {
                      if (location.pathname === '/manage-prisoner-whereabouts') {
                        window.location = '/manage-prisoner-whereabouts'
                      }
                      if (config && config.googleAnalyticsId) {
                        ReactGA.pageview(location.pathname)
                      }
                      return <Header authUrl={config.authUrl} user={user} />
                    }}
                  />
                  {shouldShowTerms && <Terms close={() => this.hideTermsAndConditions()} />}
                  {innerContent}
                  <FeedbackBanner />
                  <FooterContainer supportUrl={config.supportUrl} prisonStaffHubUrl="/" />
                </ScrollToTop>
              </div>
            )}
          />
        </Switch>
        <ModalContainer isOpen={modalActive} showModal={setShowModalDispatch}>
          {modalContent}
        </ModalContainer>
      </Router>
    )
  }
}

App.propTypes = {
  // mapStateToProps
  agencyId: PropTypes.string,
  config: PropTypes.shape({
    mailTo: PropTypes.string,
    googleAnalyticsId: PropTypes.string,
    licencesUrl: PropTypes.string,
    flags: PropTypes.objectOf(PropTypes.string),
    supportUrl: PropTypes.string,
    authUrl: PropTypes.string,
  }).isRequired,
  date: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  menuOpen: PropTypes.bool.isRequired,
  period: PropTypes.string.isRequired,
  shouldShowTerms: PropTypes.bool.isRequired,
  user: userType,
  modalActive: PropTypes.bool,
  modalContent: PropTypes.node,

  // mapDispatchToProps
  activitiesDispatch: PropTypes.func.isRequired,
  activityDispatch: PropTypes.func.isRequired,
  boundSetMenuOpen: PropTypes.func.isRequired,
  configDispatch: PropTypes.func.isRequired,
  dateDispatch: PropTypes.func.isRequired,
  periodDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  setTermsVisibilityDispatch: PropTypes.func.isRequired,
  userDetailsDispatch: PropTypes.func.isRequired,
  setFlagsDispatch: PropTypes.func.isRequired,
  setShowModalDispatch: PropTypes.func.isRequired,
  getAbsentReasonsDispatch: PropTypes.func.isRequired,
  setOffenderPaymentDataDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  agencyId: state.app.user.activeCaseLoadId,
  caseChangeRedirect: state.app.caseChangeRedirect,
  config: state.app.config,
  date: state.search.date,
  error: state.app.error,
  menuOpen: state.app.menuOpen,
  period: state.search.period,
  shouldShowTerms: state.app.shouldShowTerms,
  user: state.app.user,
  modalActive: state.app.modalActive,
  modalContent: state.app.modalContent,
})

App.defaultProps = {
  agencyId: '',
  error: null,
  user: {},
  modalActive: false,
  modalContent: undefined,
}

const mapDispatchToProps = (dispatch) => ({
  activitiesDispatch: (text) => dispatch(setSearchActivities(text)),
  activityDispatch: (text) => dispatch(setSearchActivity(text)),
  boundSetMenuOpen: (flag) => dispatch(setMenuOpen(flag)),
  configDispatch: (config) => dispatch(setConfig(config)),
  dateDispatch: (text) => dispatch(setSearchDate(text)),
  periodDispatch: (text) => dispatch(setSearchPeriod(text)),
  resetErrorDispatch: () => dispatch(resetError()),
  setErrorDispatch: (error) => dispatch(setError(error)),
  setLoadedDispatch: (status) => dispatch(setLoaded(status)),
  setTermsVisibilityDispatch: (shouldShowTerms) => dispatch(setTermsVisibility(shouldShowTerms)),
  userDetailsDispatch: (user) => dispatch(setUserDetails(user)),
  setFlagsDispatch: (flags) => dispatch(setFlagsAction(flags)),
  setShowModalDispatch: (modalActive, modalContent) => dispatch(setShowModal(modalActive, modalContent)),
  getAbsentReasonsDispatch: () => dispatch(getAbsentReasons()),
  setOffenderPaymentDataDispatch: (offenderIndex, data) => dispatch(setActivityOffenderAttendance(offenderIndex, data)),
})

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export { App, AppContainer }
export default App
