import React from 'react'
import moment from 'moment'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
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
  setMessage,
  setTermsVisibility,
  setUserDetails,
  switchAgency,
  setLoaded,
  setSearchDate,
  setSearchLocation,
  setSearchPeriod,
  setActivityData,
  setSearchActivity,
  setSearchActivities,
  setMenuOpen,
  setCaseChangeRedirectStatus,
} from './redux/actions/index'
import ResultsHouseblockContainer from './ResultsHouseblock/ResultsHouseblockContainer'
import ResultsActivityContainer from './ResultsActivity/ResultsActivityContainer'
import GlobalSearchContainer from './GlobalSearch/GlobalSearchContainer'

import ModalProvider from './ModalProvider/index'
import PaymentReasonContainer from './ModalProvider/PaymentReasonModal/PaymentReasonContainer'
import links from './links'

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

  getActivityList = async () => {
    const { agencyId, activity, period, resetErrorDispatch, setLoadedDispatch, activityDataDispatch, date } = this.props

    try {
      resetErrorDispatch()
      setLoadedDispatch(false)
      const config = {
        params: {
          agencyId,
          locationId: activity,
          date: date === 'Today' ? moment().format('DD/MM/YYYY') : date,
          timeSlot: period,
        },
      }
      const response = await axios.get('/api/activitylist', config)
      activityDataDispatch(response.data)
    } catch (error) {
      this.handleError(error)
    }
    setLoadedDispatch(true)
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

  handleSearch = history => {
    const { activity, currentLocation, orderField, sortOrder } = this.props

    if (currentLocation && currentLocation !== '--') {
      history.push('/whereaboutsresultshouseblock')
    } else if (activity) {
      if (history.location.pathname === '/whereaboutsresultsactivity') {
        this.getActivityList(orderField, sortOrder)
      } else {
        history.push('/whereaboutsresultsactivity')
      }
    }
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

  handleLocationChange = event => {
    const { locationDispatch } = this.props

    locationDispatch(event.target.value)
  }

  handleActivityChange = event => {
    const { activityDispatch } = this.props

    activityDispatch(event.target.value)
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

  displayError = error => {
    const { setErrorDispatch } = this.props

    setErrorDispatch((error.response && error.response.data) || `Something went wrong: ${error}`)
  }

  clearMessage = () => {
    const { setMessageDispatch } = this.props

    setMessageDispatch(null)
  }

  hideTermsAndConditions = () => {
    const { setTermsVisibilityDispatch } = this.props

    setTermsVisibilityDispatch(false)
  }

  showTermsAndConditions = () => {
    const { setTermsVisibilityDispatch } = this.props

    setTermsVisibilityDispatch(true)
  }

  switchCaseLoad = async newCaseload => {
    const { switchAgencyDispatch, setErrorDispatch } = this.props

    try {
      switchAgencyDispatch(newCaseload)
      await axios.put('/api/setactivecaseload', { caseLoadId: newCaseload })
      await this.loadUserAndCaseload()
    } catch (error) {
      setErrorDispatch(error.message)
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
      setCaseChangeRedirectStatusDispatch,
      setLoadedDispatch,
      resetErrorDispatch,
      dateDispatch,
      periodDispatch,
      error,
      user,
      caseChangeRedirect,
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
            render={() => <Route exact path="/" render={() => <Redirect to="/whereaboutssearch" />} />}
          />
          <Route
            path="(/whereaboutssearch)"
            render={() => (
              <SearchContainer
                handleError={this.handleError}
                getActivityLocations={this.getActivityLocations}
                handleDateChange={event => this.handleDateChangeWithLocationsUpdate(event)}
                handlePeriodChange={event => this.handlePeriodChangeWithLocationsUpdate(event)}
                handleSearch={history => this.handleSearch(history)}
                dateDispatch={dateDispatch}
                periodDispatch={periodDispatch}
              />
            )}
          />
          <Route
            path="(/globalsearch)"
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
            path="/whereaboutsresultshouseblock"
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
            path="/whereaboutsresultsactivity"
            render={() => (
              <ResultsActivityContainer
                handleError={this.handleError}
                getActivityList={this.getActivityList}
                handleDateChange={event => this.handleDateChange(event)}
                handlePeriodChange={event => this.handlePeriodChange(event)}
                handleSearch={h => this.handleSearch(h)}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
              />
            )}
          />
          <Route exact path="/dashboard" render={() => <Dashboard />} />
          <Route
            exact
            path="/establishmentroll"
            render={() => (
              <EstablishmentRollContainer
                handleError={this.handleError}
                setCaseChangeRedirectStatusDispatch={setCaseChangeRedirectStatusDispatch}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
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
            render={props => {
              if (config && config.googleAnalyticsId) {
                ReactGA.pageview(props.location.pathname)
              }
              return (
                <Header
                  homeLink={links.getHomeLink()}
                  title={title}
                  logoText="HMPPS"
                  user={user}
                  switchCaseLoad={this.switchCaseLoad}
                  menuOpen={menuOpen}
                  setMenuOpen={boundSetMenuOpen}
                  caseChangeRedirect={caseChangeRedirect}
                  history={props.history}
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
  activity: PropTypes.string.isRequired,
  agencyId: PropTypes.string,
  caseChangeRedirect: PropTypes.bool.isRequired,
  config: PropTypes.shape({
    notmEndpointUrl: PropTypes.string,
    mailTo: PropTypes.string,
    googleAnalyticsId: PropTypes.string,
  }).isRequired,
  currentLocation: PropTypes.string.isRequired, // NOTE prop name location clashes with history props
  date: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  menuOpen: PropTypes.bool.isRequired,
  orderField: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  shouldShowTerms: PropTypes.bool.isRequired,
  sortOrder: PropTypes.string.isRequired,
  user: PropTypes.shape({
    firstName: PropTypes.string,
    activeCaseLoadId: PropTypes.string,
    isOpen: PropTypes.bool,
  }),
  title: PropTypes.string.isRequired,

  // mapDispatchToProps
  activitiesDispatch: PropTypes.func.isRequired,
  activityDataDispatch: PropTypes.func.isRequired,
  activityDispatch: PropTypes.func.isRequired,
  boundSetMenuOpen: PropTypes.func.isRequired,
  configDispatch: PropTypes.func.isRequired,
  dateDispatch: PropTypes.func.isRequired,
  locationDispatch: PropTypes.func.isRequired,
  periodDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setCaseChangeRedirectStatusDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  setMessageDispatch: PropTypes.func.isRequired,
  setTermsVisibilityDispatch: PropTypes.func.isRequired,
  switchAgencyDispatch: PropTypes.func.isRequired,
  userDetailsDispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  activity: state.search.activity,
  agencyId: state.app.user.activeCaseLoadId,
  caseChangeRedirect: state.app.caseChangeRedirect,
  config: state.app.config,
  currentLocation: state.search.location, // NOTE prop name location clashes with history props
  date: state.search.date,
  error: state.app.error,
  menuOpen: state.app.menuOpen,
  orderField: state.events.orderField,
  period: state.search.period,
  shouldShowTerms: state.app.shouldShowTerms,
  sortOrder: state.events.sortOrder,
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
  activityDataDispatch: data => dispatch(setActivityData(data)),
  activityDispatch: text => dispatch(setSearchActivity(text)),
  boundSetMenuOpen: flag => dispatch(setMenuOpen(flag)),
  configDispatch: config => dispatch(setConfig(config)),
  dateDispatch: text => dispatch(setSearchDate(text)),
  locationDispatch: text => dispatch(setSearchLocation(text)),
  periodDispatch: text => dispatch(setSearchPeriod(text)),
  resetErrorDispatch: () => dispatch(resetError()),
  setCaseChangeRedirectStatusDispatch: flag => dispatch(setCaseChangeRedirectStatus(flag)),
  setErrorDispatch: error => dispatch(setError(error)),
  setLoadedDispatch: status => dispatch(setLoaded(status)),
  setMessageDispatch: message => dispatch(setMessage(message)),
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
