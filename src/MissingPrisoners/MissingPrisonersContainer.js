import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import moment from 'moment'

import Page from '../Components/Page'
import MissingPrisonersSearch from './MissingPrisonersSearch'
import MissingPrisoners from './MissingPrisoners'
import { LAST_NAME } from '../tablesorting/sortColumns'
import sortResults from '../ResultsActivity/activityResultsSorter'

function MissingPrisonersContainer({
  setLoadedDispatch,
  resetErrorDispatch,
  raiseAnalyticsEvent,
  showModal,
  setActivityOffenderAttendance,
  handlePeriodChange,
  handleDateChange,
  handleError,
  period,
  date,
  agencyId,
  userRoles,
}) {
  const [reloadPage, setReloadPage] = useState(false)
  const [missingPrisoners, setMissingPrisoners] = useState([])
  const [sortOrder, setSortOrder] = useState({
    orderColumn: LAST_NAME,
    orderDirection: 'ASC',
  })

  const setColumnSort = (orderColumn, orderDirection) => {
    setSortOrder({ orderColumn, orderDirection })
    sortResults(missingPrisoners, orderColumn, orderDirection)
    setMissingPrisoners(missingPrisoners)
  }

  const activityHubUser = userRoles.includes('ACTIVITY_HUB')

  useEffect(
    () => {
      const getMissingPrisoners = async () => {
        resetErrorDispatch()
        setLoadedDispatch(false)

        try {
          const response = await axios.get('/api/missing-prisoners', {
            params: {
              agencyId,
              timeSlot: period,
              date: date === 'Today' ? moment().format('DD/MM/YYYY') : date,
            },
          })

          const offenders = response.data.map(offender => ({
            eventLocationId: offender.locationId,
            ...offender,
          }))

          setMissingPrisoners(offenders)
        } catch (error) {
          handleError(error)
        }

        setLoadedDispatch(true)
      }

      getMissingPrisoners()
      setReloadPage(false)
    },
    [period, date, reloadPage]
  )

  return (
    <Page title="Missing prisoners" alwaysRender>
      <MissingPrisonersSearch
        handleDateChange={handleDateChange}
        handlePeriodChange={handlePeriodChange}
        date={date}
        period={period}
        sortOrder={sortOrder}
        setColumnSort={setColumnSort}
        numberOfPrisoners={missingPrisoners.length}
        reloadPage={setReloadPage}
      />
      <MissingPrisoners
        missingPrisoners={missingPrisoners}
        sortOrder={sortOrder}
        setColumnSort={setColumnSort}
        date={date}
        period={period}
        agencyId={agencyId}
        resetErrorDispatch={resetErrorDispatch}
        raiseAnalyticsEvent={raiseAnalyticsEvent}
        setActivityOffenderAttendance={setActivityOffenderAttendance}
        showModal={showModal}
        handleError={handleError}
        activityHubUser={activityHubUser}
      />
    </Page>
  )
}

MissingPrisonersContainer.propTypes = {
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  setActivityOffenderAttendance: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
}

const mapStateToProps = state => ({
  date: state.search.date,
  period: state.search.period,
  agencyId: state.app.user.activeCaseLoadId,
  userRoles: state.app.user.roles,
})

export { MissingPrisonersContainer }

export default connect(mapStateToProps)(MissingPrisonersContainer)
