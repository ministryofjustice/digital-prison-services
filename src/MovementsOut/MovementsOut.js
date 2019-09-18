import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import Flags from '../FullFlags/Flags'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import HoursAndMinutes from '../HoursAndMinutes'
import { LAST_NAME } from '../tablesorting/sortColumns'

const MovementsOut = ({ rows, sortOrder, setColumnSort }) => (
  <>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      </GridCol>
    </GridRow>
    <table>
      <thead>
        <tr>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
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
      <tbody>
        {rows.map(row => (
          <tr className="row-gutters" key={[row.offenderNo, row.reasonDescription, row.timeOut].join('_')}>
            <td className="row-gutters">
              <OffenderImage offenderNo={row.offenderNo} />
            </td>
            <td className="row-gutters">
              <OffenderName lastName={row.lastName} firstName={row.firstName} />
            </td>
            <td className="row-gutters">{row.offenderNo}</td>
            <td className="row-gutters">
              <DateFormatter isoDate={row.dateOfBirth} />
            </td>
            <td>
              <HoursAndMinutes hhmmss={row.timeOut} />
            </td>
            <td>{row.reasonDescription}</td>
            <td className="row-gutters">
              <Flags alerts={row.alerts} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

MovementsOut.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      timeOut: PropTypes.string,
      reasonDescription: PropTypes.string,
      alerts: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
}
MovementsOut.defaultProps = {
  rows: [],
  sortOrder: '',
  setColumnSort: () => {},
}

export default MovementsOut
