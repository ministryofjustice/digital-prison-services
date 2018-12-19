import React from 'react'
import PropTypes from 'prop-types'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderLink from '../OffenderLink'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import Location from '../Location'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'
import Flags from '../Flags/Flags'
import FullFlags from '../FullFlags/FullFlags'

const movementInType = {
  offenderNo: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  movementTime: PropTypes.string,
  fromAgencyDescription: PropTypes.string,
  alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  category: PropTypes.string,
}

const movementsInType = {
  movementsIn: PropTypes.arrayOf(PropTypes.shape(movementInType)).isRequired,
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementsIn = props => {
  const { movementsIn, sortOrder, setColumnSort } = props
  return (
    <React.Fragment>
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      <MovementsInTable movementsIn={movementsIn} sortOrder={sortOrder} setColumnSort={setColumnSort} />
    </React.Fragment>
  )
}

MovementsIn.propTypes = movementsInType

const MovementsInTable = ({ movementsIn, sortOrder, setColumnSort }) => (
  <table className="row-gutters">
    <MovementsInTableHeadings sortOrder={sortOrder} setColumnSort={setColumnSort} />
    <tbody>
      {movementsIn.map(movementIn => (
        <MovementInRow movementIn={movementIn} key={movementIn.offenderNo} />
      ))}
    </tbody>
  </table>
)

MovementsInTable.propTypes = movementsInType

const MovementsInTableHeadings = props => {
  const { sortOrder, setColumnSort } = props
  return (
    <thead>
      <tr>
        <th className="straight width10" />
        <th className="straight width10">
          <SortableColumn
            heading="Name"
            column={LAST_NAME}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={LAST_NAME}
          />
        </th>
        <th className="straight width10">Prison no.</th>
        <th className="straight width10">D.O.B.</th>
        <th className="straight width10">Location</th>
        <th className="straight width10">Time in</th>
        <th className="straight width15">Arrived from</th>
        <th className="straight width25">Flags</th>
      </tr>
    </thead>
  )
}
MovementsInTableHeadings.propTypes = {
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementInRow = props => {
  const {
    movementIn: {
      alerts,
      category,
      dateOfBirth,
      firstName,
      fromAgencyDescription,
      lastName,
      location,
      movementTime,
      offenderNo,
    },
  } = props
  return (
    <tr className="row-gutters">
      <td className="row-gutters">
        <OffenderLink offenderNo={offenderNo}>
          <OffenderImage offenderNo={offenderNo} />
        </OffenderLink>
      </td>
      <td className="row-gutters">
        <OffenderLink offenderNo={offenderNo}>
          <OffenderName lastName={lastName} firstName={firstName} />
        </OffenderLink>
      </td>
      <td className="row-gutters">{offenderNo}</td>
      <td className="row-gutters">
        <DateFormatter isoDate={dateOfBirth} />
      </td>
      <td className="row-gutters">
        <Location location={location} />
      </td>
      <td>
        <HoursAndMinutes hhmmss={movementTime} />
      </td>
      <td>{fromAgencyDescription}</td>
      <td className="row-gutters">{FullFlags(alerts, category)}</td>
    </tr>
  )
}

MovementInRow.propTypes = {
  movementIn: PropTypes.shape(movementInType).isRequired,
}

export default MovementsIn
