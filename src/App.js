import React from 'react'
import moment from 'moment'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Notifications from 'react-notify-toast'
import ReactGA from 'react-ga'
import { Header, FooterContainer } from 'new-nomis-shared-components'
import Dashboard from './Dashboard/index'
import ErrorComponent from './Error/index'
import SearchContainer from './Search/SearchContainer'
import EstablishmentRollContainer from './EstablishmentRoll/EstablishmentRollContainer'
import Terms from './Footer/terms-and-conditions'
import './App.scss'
import ScrollToTop from './Components/ScrollToTop'

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
  setShowModal,
} from './redux/actions/index'
import ResultsHouseblockContainer from './ResultsHouseblock/ResultsHouseblockContainer'
import ResultsActivityContainer from './ResultsActivity/ResultsActivityContainer'
import GlobalSearchContainer from './GlobalSearch/GlobalSearchContainer'

import links from './links'
import MovementsInContainer from './MovementsIn/MovementsInContainer'
import MovementsOutContainer from './MovementsOut/MovementsOutContainer'
import InReceptionContainer from './InReception/InReceptionContainer'
import CurrentlyOutContainer, { fetchAgencyData, fetchLivingUnitData } from './CurrentlyOut/CurrentlyOutContainer'
import IepHistoryContainer from './IepDetails/IepDetailsContainer'
import IepChangeContainer from './IepDetails/IepChangeContainer'
import EnRouteContainer from './EnRoute/EnRouteContainer'
import AppointmentDetailsContainer from './BulkAppointments/AppointmentDetailsForm/AppointmentDetailsContainer'
import AdjudicationHistoryContainer from './Adjudications/AdjudicationHistory/AdjudicationHistoryContainer'
import AdjudicationDetailContainer from './Adjudications/AdjudicationDetail/AdjudicationDetailContainer'
import routePaths from './routePaths'
import Content from './Components/Content'
import AddPrisonerContainer from './BulkAppointments/AddPrisoners/AddPrisonersContainer'
import { setFlagsAction } from './flags'
import ModalContainer from './Components/ModalContainer'
import { userType } from './types'
import IEPSlipContainer from './IEPSlipContainer'
import MissingPrisonersContainer from './MissingPrisoners/MissingPrisonersContainer'

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
      const [config] = await Promise.all([axios.get('/api/config'), this.loadUserAndCaseload()])

      links.notmEndpointUrl = config.data.notmEndpointUrl
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

  updateFeatureFlags = flags => {
    const { config, user, setFlagsDispatch } = this.props
    const featureFlags = {
      ...flags,
      updateAttendanceEnabled: config.updateAttendancePrisons.includes(user.activeCaseLoadId),
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
    if (event && config.googleAnalyticsId) {
      ReactGA.event(event)
    }
  }

  displayAlertAndLogout = message => {
    alert(message) // eslint-disable-line no-alert
    window.location = '/auth/logout'
  }

  shouldDisplayInnerContent = () => {
    const { shouldShowTerms, user } = this.props

    // only show inner content if the user has been loaded
    return !shouldShowTerms && user && user.username
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

  switchCaseLoad = async (newCaseload, location) => {
    const { switchAgencyDispatch, config } = this.props
    const redirectToNotm =
      location.pathname.includes('global-search-results') || location.pathname.includes('offenders')

    try {
      if (redirectToNotm) {
        await axios.put('/api/setactivecaseload', { caseLoadId: newCaseload })
        window.location.assign(config.notmEndpointUrl)
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
    const [user, caseloads, roles] = await Promise.all([
      axios.get('/api/me'),
      axios.get('/api/usercaseloads'),
      axios.get('/api/userroles'),
    ])

    const activeCaseLoad = caseloads.data.find(cl => cl.currentlyActive)
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
      dateDispatch,
      periodDispatch,
      error,
      user,
      title,
      agencyId,
      modalActive,
      modalContent,
      setShowModalDispatch,
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
            path="/(global-search-results|global-search)"
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
                showModal={setShowModalDispatch}
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
                showModal={setShowModalDispatch}
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

          <Route
            exact
            path={routePaths.inReception}
            render={({ history }) => (
              <InReceptionContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.currentlyOut}
            render={({ history, match: { params } }) => (
              <CurrentlyOutContainer
                handleError={this.handleError}
                history={history}
                dataFetcher={fetchLivingUnitData(params)}
              />
            )}
          />

          <Route
            exact
            path={routePaths.totalOut}
            render={({ history }) => (
              <CurrentlyOutContainer
                handleError={this.handleError}
                history={history}
                dataFetcher={fetchAgencyData(agencyId)}
              />
            )}
          />

          <Route
            exact
            path={routePaths.enRoute}
            render={({ history }) => (
              <EnRouteContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.bulkAppointments}
            render={({ history }) => (
              <AppointmentDetailsContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.bulkAppointmentsAddPrisoners}
            render={({ history }) => (
              <AddPrisonerContainer
                handleError={this.handleError}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.iepHistory}
            render={({ history, match: { params } }) => (
              <IepHistoryContainer
                offenderNo={params.offenderNo}
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.iepChange}
            render={({ history, match: { params } }) => (
              <IepChangeContainer
                offenderNo={params.offenderNo}
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
                raiseAnalyticsEvent={this.raiseAnalyticsEvent}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.adjudications}
            render={({ history, match: { params } }) => (
              <AdjudicationHistoryContainer
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
                offenderNumber={params.offenderNo}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.adjudication}
            render={({ history, match: { params } }) => (
              <AdjudicationDetailContainer
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
                offenderNumber={params.offenderNo}
                adjudicationNumber={params.adjudicationNo}
                history={history}
              />
            )}
          />

          <Route
            exact
            path={routePaths.missingPrisoners}
            render={({ history, match: { params } }) => (
              <MissingPrisonersContainer
                handleDateChange={event => this.handleDateChange(event)}
                handlePeriodChange={event => this.handlePeriodChange(event)}
                handleError={this.handleError}
                setLoadedDispatch={setLoadedDispatch}
                resetErrorDispatch={resetErrorDispatch}
                history={history}
              />
            )}
          />
        </div>

        <Route exact path="/content/:post" component={Content} />
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
              return <IEPSlipContainer />
            }}
          />
          <Route
            render={() => (
              <div className="content">
                <ScrollToTop>
                  <Notifications />
                  <Route
                    render={({ location, history }) => {
                      if (config && config.googleAnalyticsId) {
                        ReactGA.pageview(location.pathname)
                      }
                      const locationRequiresRedirectWhenCaseloadChanges = !(
                        location.pathname.includes('global-search-results') ||
                        location.pathname.includes('establishment-roll') ||
                        location.pathname.includes('content')
                      )

                      return (
                        <Header
                          homeLink={config.notmEndpointUrl}
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
                  {innerContent}
                  <FooterContainer feedbackEmail={config.mailTo} prisonStaffHubUrl="/" />
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
    notmEndpointUrl: PropTypes.string,
    mailTo: PropTypes.string,
    googleAnalyticsId: PropTypes.string,
    licencesUrl: PropTypes.string,
  }).isRequired,
  date: PropTypes.string.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
  menuOpen: PropTypes.bool.isRequired,
  period: PropTypes.string.isRequired,
  shouldShowTerms: PropTypes.bool.isRequired,
  user: userType,
  title: PropTypes.string.isRequired,
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
  switchAgencyDispatch: PropTypes.func.isRequired,
  userDetailsDispatch: PropTypes.func.isRequired,
  setFlagsDispatch: PropTypes.func.isRequired,
  setShowModalDispatch: PropTypes.func.isRequired,
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
  setFlagsDispatch: flags => dispatch(setFlagsAction(flags)),
  setShowModalDispatch: (modalActive, modalContent) => dispatch(setShowModal(modalActive, modalContent)),
})

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export { App, AppContainer }
export default App
