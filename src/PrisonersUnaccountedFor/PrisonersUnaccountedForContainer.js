import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import moment from 'moment'

import { stripAgencyPrefix } from '../../backend/utils'
import Page from '../Components/Page'
import PrisonersUnaccountedForSearch from './PrisonersUnaccountedForSearch'
import PrisonersUnaccountedFor from './PrisonersUnaccountedFor'
import { LAST_NAME } from '../tablesorting/sortColumns'
import sortResults from '../ResultsActivity/activityResultsSorter'

function PrisonersUnaccountedForContainer({
  setLoadedDispatch,
  resetErrorDispatch,
  setErrorDispatch,
  raiseAnalyticsEvent,
  showModal,
  setOffenderPaymentDataDispatch,
  getAbsentReasonsDispatch,
  handlePeriodChange,
  handleDateChange,
  handleError,
  period,
  date,
  agencyId,
  userRoles,
}) {
  const [reloadPage, setReloadPage] = useState(false)
  const [prisonersUnaccountedFor, setPrisonersUnaccountedFor] = useState([])
  const [sortOrder, setSortOrder] = useState({
    orderColumn: LAST_NAME,
    orderDirection: 'ASC',
  })

  const setColumnSort = (orderColumn, orderDirection) => {
    setSortOrder({ orderColumn, orderDirection })
    sortResults(prisonersUnaccountedFor, orderColumn, orderDirection)
    setPrisonersUnaccountedFor(prisonersUnaccountedFor)
  }

  const activityHubUser = userRoles.includes('ACTIVITY_HUB')

  const uniqueOffenderNos = new Set(prisonersUnaccountedFor.map(prisoner => prisoner.offenderNo))

  useEffect(
    () => {
      const getPrisonersUnaccountedFor = async () => {
        resetErrorDispatch()
        setLoadedDispatch(false)

        try {
          const response = await axios.get('/api/prisoners-unaccounted-for', {
            params: {
              agencyId,
              timeSlot: period,
              date: date === 'Today' ? moment().format('DD/MM/YYYY') : date,
            },
          })

          const offenders = response.data.map((offender, index) => ({
            eventLocationId: offender.locationId,
            offenderIndex: index,
            inCaseLoad: stripAgencyPrefix(offender.cellLocation, agencyId),
            ...offender,
          }))

          setPrisonersUnaccountedFor(offenders)
          getAbsentReasonsDispatch()
          sortResults(offenders, sortOrder.orderColumn, sortOrder.orderDirection)
        } catch (error) {
          handleError(error)
        }

        setLoadedDispatch(true)
      }

      getPrisonersUnaccountedFor()
      setReloadPage(false)

      return resetErrorDispatch
    },
    [period, date, reloadPage]
  )

  return (
    <Page title="Prisoners unaccounted for" alwaysRender>
      <PrisonersUnaccountedForSearch
        handleDateChange={handleDateChange}
        handlePeriodChange={handlePeriodChange}
        date={date}
        period={period}
        sortOrder={sortOrder}
        setColumnSort={setColumnSort}
        numberOfPrisoners={uniqueOffenderNos.size}
        reloadPage={setReloadPage}
      />
      <PrisonersUnaccountedFor
        prisonersUnaccountedFor={prisonersUnaccountedFor}
        sortOrder={sortOrder}
        setColumnSort={setColumnSort}
        date={date}
        period={period}
        agencyId={agencyId}
        resetErrorDispatch={resetErrorDispatch}
        setErrorDispatch={setErrorDispatch}
        reloadPage={setReloadPage}
        raiseAnalyticsEvent={raiseAnalyticsEvent}
        setOffenderPaymentDataDispatch={setOffenderPaymentDataDispatch}
        showModal={showModal}
        handleError={handleError}
        activityHubUser={activityHubUser}
      />
    </Page>
  )
}

PrisonersUnaccountedForContainer.propTypes = {
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  setErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  setOffenderPaymentDataDispatch: PropTypes.func.isRequired,
  getAbsentReasonsDispatch: PropTypes.func.isRequired,
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

export { PrisonersUnaccountedForContainer }

export default connect(mapStateToProps)(PrisonersUnaccountedForContainer)
