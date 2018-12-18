import React from 'react'
import PropTypes from 'prop-types'
import FullFlags from '../FullFlags/FullFlags'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'

const movementOutType = {
  offenderNo: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  timeOut: PropTypes.string,
  reasonDescription: PropTypes.string,
  category: PropTypes.string,
  alerts: PropTypes.arrayOf(PropTypes.shape(PropTypes.string)),
}

const movementsOutType = {
  movementsOut: PropTypes.arrayOf(PropTypes.shape(movementOutType)).isRequired,
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementsOut = props => {
  const { movementsOut, sortOrder, setColumnSort } = props
  return (
    <div>
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      <MovementsOutTable movementsOut={movementsOut} sortOrder={sortOrder} setColumnSort={setColumnSort} />
    </div>
  )
}

MovementsOut.propTypes = movementsOutType

const MovementsOutTable = ({ movementsOut, sortOrder, setColumnSort }) => (
  <table className="row-gutters">
    <MovementsInTableHeadings sortOrder={sortOrder} setColumnSort={setColumnSort} />
    <tbody>
      {movementsOut.map(movementOut => (
        <MovementOutRow movementOut={movementOut} key={movementOut.offenderNo} />
      ))}
    </tbody>
  </table>
)

MovementsOutTable.propTypes = movementsOutType

const MovementsInTableHeadings = props => {
  const { sortOrder, setColumnSort } = props
  return (
    <thead>
      <tr>
        <th className="straight width5" />
        <th className="straight width15">
          <SortableColumn
            heading="Name"
            column={LAST_NAME}
            sortOrder={sortOrder}
            setColumnSort={setColumnSort}
            sortColumn={LAST_NAME}
          />
        </th>
        <th className="straight width5">Prison no.</th>
        <th className="straight width5">D.O.B.</th>
        <th className="straight width5">Time out</th>
        <th className="straight width10">Reason</th>
        <th className="straight width15">Flags</th>
      </tr>
    </thead>
  )
}
MovementsInTableHeadings.propTypes = {
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
}

const MovementOutRow = props => {
  const {
    movementOut: { lastName, firstName, offenderNo, dateOfBirth, timeOut, reasonDescription, alerts, category },
  } = props
  return (
    <tr className="row-gutters">
      <td className="row-gutters">
        <OffenderImage offenderNo={offenderNo} />
      </td>
      <td className="row-gutters">
        <OffenderName lastName={lastName} firstName={firstName} />
      </td>
      <td className="row-gutters">{offenderNo}</td>
      <td className="row-gutters">
        <DateFormatter isoDate={dateOfBirth} />
      </td>
      <td>
        <HoursAndMinutes hhmmss={timeOut} />
      </td>
      <td>{reasonDescription}</td>
      <td className="row-gutters">{FullFlags(alerts, category)}</td>
    </tr>
  )
}

MovementOutRow.propTypes = {
  movementOut: PropTypes.shape(movementOutType).isRequired,
}

export default MovementsOut
