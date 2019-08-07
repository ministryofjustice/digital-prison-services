import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import axios from 'axios'
import moment from 'moment'

import Page from '../Components/Page'
import MissingPrisonersSearch from './MissingPrisonersSearch'
import MissingPrisoners from './MissingPrisoners'

function MissingPrisonersContainer({
  setLoadedDispatch,
  handlePeriodChange,
  handleDateChange,
  period,
  date,
  agencyId,
}) {
  const [missingPrisoners, setMissingPrisoners] = useState()

  useEffect(
    () => {
      const getMissingPrisoners = async () => {
        setLoadedDispatch(false)
        const response = await axios.get('/api/missing-prisoners', {
          params: {
            agencyId,
            timeSlot: period,
            date: date === 'Today' ? moment().format('DD/MM/YYYY') : date,
          },
        })
        setMissingPrisoners(response.data)
        setLoadedDispatch(true)
      }

      getMissingPrisoners()
    },
    [period, date]
  )

  return (
    <Page title="Missing prisoners">
      <MissingPrisonersSearch
        handleDateChange={handleDateChange}
        handlePeriodChange={handlePeriodChange}
        date={date}
        period={period}
      />
      <MissingPrisoners missingPrisoners={missingPrisoners} />
    </Page>
  )
}

MissingPrisonersContainer.propTypes = {
  setLoadedDispatch: PropTypes.func.isRequired,
  handlePeriodChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
  date: state.search.date,
  period: state.search.period,
  agencyId: state.app.user.activeCaseLoadId,
})

export default connect(mapStateToProps)(MissingPrisonersContainer)
