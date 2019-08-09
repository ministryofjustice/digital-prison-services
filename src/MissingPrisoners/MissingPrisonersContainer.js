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
  handlePeriodChange,
  handleDateChange,
  handleError,
  period,
  date,
  agencyId,
}) {
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

          setMissingPrisoners(response.data)
        } catch (error) {
          handleError(error)
        }

        setLoadedDispatch(true)
      }

      getMissingPrisoners()
    },
    [period, date]
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
      />
      <MissingPrisoners missingPrisoners={missingPrisoners} sortOrder={sortOrder} setColumnSort={setColumnSort} />
    </Page>
  )
}

MissingPrisonersContainer.propTypes = {
  setLoadedDispatch: PropTypes.func.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
  date: state.search.date,
  period: state.search.period,
  agencyId: state.app.user.activeCaseLoadId,
})

export { MissingPrisonersContainer }

export default connect(mapStateToProps)(MissingPrisonersContainer)
