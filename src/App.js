import React from 'react'
import moment from 'moment'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ReactGA from 'react-ga'
import { Header } from 'new-nomis-shared-components'
import Dashboard from './Dashboard/index'
import Footer from './Footer/index'
import ErrorComponent from './Error/index'
import SearchContainer from './Search/SearchContainer'
import EstablishmentRollContainer from './EstablishmentRoll/EstablishmentRollContainer'
import Terms from './Footer/terms-and-conditions'
import './App.scss'

import {
  resetError,
  setConfig,
  setError,
  setLoaded,
  setMenuOpen,
  setSearchActivities,
  setSearchActivity,
  setSearchDate,
  setSearchPeriod,
  setTermsVisibility,
  setUserDetails,
  switchAgency,
} from './redux/actions/index'
import ResultsHouseblockContainer from './ResultsHouseblock/ResultsHouseblockContainer'
import ResultsActivityContainer from './ResultsActivity/ResultsActivityContainer'
import GlobalSearchContainer from './GlobalSearch/GlobalSearchContainer'

import ModalProvider from './ModalProvider/index'
import PaymentReasonContainer from './ModalProvider/PaymentReasonModal/PaymentReasonContainer'
import links from './links'
import MovementsInContainer from './MovementsIn/MovementsInContainer'
import MovementsOutContainer from './MovementsOut/MovementsOutContainer'
import routePaths from './routePaths'

const axios = require('axios')

class App extends React.Component {
  async componentWillMount() {
    const { configDispatch, setErrorDispatch } = this.props

    axios.interceptors.response.use(
      config => {
        if (config.status === 205) {
          // eslint-disable-next-line no-alert
          alert(
            "There is a newer version of this website available, click ok to ensure you're using the latest version."
          )
          window.location = '/auth/logout'
        }
        return config
      },
      error => Promise.reject(error)
    )

    try {
      this.loadUserAndCaseload()

      const config = await axios.get('/api/config')
      links.notmEndpointUrl = config.data.notmEndpointUrl
      if (config.data.googleAnalyticsId) {
        ReactGA.initialize(config.data.googleAnalyticsId)
      }

      configDispatch(config.data)
    } catch (error) {
      setErrorDispatch(error.message)
    }
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
      activitiesDispatch(response.data)
      // set to unselected
      activityDispatch('--')
    } catch (error) {
      this.handleError(error)
    }
    setLoadedDispatch(true)
  }

  handlePeriodChange = event => {
    const { periodDispatch } = this.props

    periodDispatch(event.target.value)
  }

  handlePeriodChangeWithLocationsUpdate = event => {
    const { periodDispatch } = this.props

    periodDispatch(event.target.value)
    this.getActivityLocations(null, event.target.value)
  }

  raiseAnalyticsEvent = event => {
    const { config } = this.props

    if (config.googleAnalyticsId) {
      ReactGA.event(event)
    }
  }

  displayAlertAndLogout = message => {
    alert(message) // eslint-disable-line no-alert
    window.location = '/auth/logout'
  }

  shouldDisplayInnerContent = () => {
    const { shouldShowTerms, user } = this.props

    return !shouldShowTerms && (user && user.activeCaseLoadId)
  }

  handleDateChange = date => {
    const { dateDispatch } = this.props

    if (date) {
      dateDispatch(moment(date).format('DD/MM/YYYY'))
    }
  }

  handleDateChangeWithLocationsUpdate = date => {
    const { dateDispatch } = this.props

    if (date) {
      const formattedDate = moment(date).format('DD/MM/YYYY')
      dateDispatch(formattedDate)
      this.getActivityLocations(formattedDate, null)
    }
  }

  handleError = error => {
    const { setErrorDispatch } = this.props
    if (
      error.response &&
      error.response.status === 401 &&
      (error.response.data && error.response.data.reason === 'session-expired')
    ) {
      this.displayAlertAndLogout('Your session has expired, please click OK to be redirected back to the login page')
    } else {
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

  switchCaseLoad = async (newCaseload, location) => {
    const { switchAgencyDispatch } = this.props

    try {
      if (location.pathname.includes('global-search-results')) {
        await axios.put('/api/setactivecaseload', { caseLoadId: newCaseload })
        window.location.assign(links.notmEndpointUrl)
      } else {
        switchAgencyDispatch(newCaseload)
        await axios.put('/api/setactivecaseload', { caseLoadId: newCaseload })
        await this.loadUserAndCaseload()
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  loadUserAndCaseload = async () => {
    const { userDetailsDispatch } = this.props
    const user = await axios.get('/api/me')
    const caseloads = await axios.get('/api/usercaseloads')

    userDetailsDispatch({ ...user.data, caseLoadOptions: caseloads.data })
  }

  render() {
    const {
      config,
      menuOpen,
      boundSetMenuOpen,
      shouldShowTerms,
      setLoadedDispatch,
      resetErrorDispatch,
      dateDispatch,
      periodDispatch,
      error,
      user,
      title,
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
            path="(/)"
            render={() => <Route exact path="/" render={() => <Redirect to="/search-prisoner-whereabouts" />} />}
          />
          <Route
            exact
            path="(/search-prisoner-whereabouts)"
            render={() => (
              <SearchContainer
                handleError={this.handleError}
                getActivityLocations={this.getActivityLocations}
                handleDateChange={event => this.handleDateChangeWithLocationsUpdate(event)}
                handlePeriodChange={event => this.handlePeriodChangeWithLocationsUpdate(event)}
                dateDispatch={dateDispatch}
                periodDispatch={periodDispatch}
              />
            )}
          />
          <Route
            path="(/global-search-results)"
            render={() => (
              <GlobalSearchContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                setLoadedDispatch={setLoadedDispatch}
              />
            )}
          />
          <Route
            exact
            path="/search-prisoner-whereabouts/housing-block-results"
            render={() => (
              <ResultsHouseblockContainer
                handleError={this.handleError}
                handleDateChange={event => this.handleDateChange(event)}
                handlePeriodChange={event => this.handlePeriodChange(event)}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
              />
            )}
          />
          <Route
            exact
            path="/search-prisoner-whereabouts/activity-results"
            render={() => (
              <ResultsActivityContainer
                handleError={this.handleError}
                handleDateChange={event => this.handleDateChange(event)}
                handlePeriodChange={event => this.handlePeriodChange(event)}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
              />
            )}
          />
          <Route exact path="/dashboard" render={() => <Dashboard />} />
          <Route
            exact
            path={routePaths.establishmentRoll}
            render={() => (
              <EstablishmentRollContainer
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
              />
            )}
          />
          <Route
            exact
            path={routePaths.inToday}
            render={({ history }) => <MovementsInContainer handleError={this.handleError} history={history} />}
          />

          <Route
            exact
            path={routePaths.outToday}
            render={({ history }) => (
              <MovementsOutContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
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
        <div className="content">
          <Route
            render={({ location, history }) => {
              if (config && config.googleAnalyticsId) {
                ReactGA.pageview(location.pathname)
              }
              const locationRequiresRedirectWhenCaseloadChanges = !(
                location.pathname.includes('global-search-results') || location.pathname.includes('establishment-roll')
              )

              return (
                <Header
                  homeLink={links.getHomeLink()}
                  title={title}
                  logoText="HMPPS"
                  user={user}
                  switchCaseLoad={newCaseload => this.switchCaseLoad(newCaseload, location)}
                  menuOpen={menuOpen}
                  setMenuOpen={boundSetMenuOpen}
                  caseChangeRedirect={locationRequiresRedirectWhenCaseloadChanges}
                  history={history}
                />
              )
            }}
          />
          {shouldShowTerms && <Terms close={() => this.hideTermsAndConditions()} />}
          <ModalProvider>
            <PaymentReasonContainer key="payment-reason-modal" handleError={this.handleError} />
          </ModalProvider>
          {innerContent}
          <Footer
            setMenuOpen={boundSetMenuOpen}
            showTermsAndConditions={this.showTermsAndConditions}
            mailTo={config && config.mailTo}
          />
        </div>
      </Router>
    )
  }
}

App.propTypes = {
  // mapStateToProps
  agencyId: PropTypes.string,
  config: PropTypes.shape({
    notmEndpointUrl: PropTypes.string,
    mailTo: PropTypes.string,
    googleAnalyticsId: PropTypes.string,
  }).isRequired,
  date: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  menuOpen: PropTypes.bool.isRequired,
  period: PropTypes.string.isRequired,
  shouldShowTerms: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    activeCaseLoadId: PropTypes.string,
    isOpen: PropTypes.bool,
  }),
  title: PropTypes.string.isRequired,

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
  switchAgencyDispatch: PropTypes.func.isRequired,
  userDetailsDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  agencyId: state.app.user.activeCaseLoadId,
  caseChangeRedirect: state.app.caseChangeRedirect,
  config: state.app.config,
  date: state.search.date,
  error: state.app.error,
  menuOpen: state.app.menuOpen,
  period: state.search.period,
  shouldShowTerms: state.app.shouldShowTerms,
  user: state.app.user,
  title: state.app.title,
})

App.defaultProps = {
  agencyId: '',
  error: null,
  user: {},
}

const mapDispatchToProps = dispatch => ({
  activitiesDispatch: text => dispatch(setSearchActivities(text)),
  activityDispatch: text => dispatch(setSearchActivity(text)),
  boundSetMenuOpen: flag => dispatch(setMenuOpen(flag)),
  configDispatch: config => dispatch(setConfig(config)),
  dateDispatch: text => dispatch(setSearchDate(text)),
  periodDispatch: text => dispatch(setSearchPeriod(text)),
  resetErrorDispatch: () => dispatch(resetError()),
  setErrorDispatch: error => dispatch(setError(error)),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  setTermsVisibilityDispatch: shouldShowTerms => dispatch(setTermsVisibility(shouldShowTerms)),
  switchAgencyDispatch: agencyId => dispatch(switchAgency(agencyId)),
  userDetailsDispatch: user => dispatch(setUserDetails(user)),
})

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export { App, AppContainer }
export default App
